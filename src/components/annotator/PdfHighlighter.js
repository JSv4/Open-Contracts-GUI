// @flow
import React, { PureComponent } from "react";
import ReactDom from "react-dom";
import Pointable from "react-pointable";
import debounce from "lodash.debounce";

import { EventBus, PDFViewer, PDFLinkService } from "pdfjs-dist/web/pdf_viewer";

//$FlowFixMe
import "pdfjs-dist/web/pdf_viewer.css";
import "react-pdf-highlighter/build/style/pdf_viewer.css";
import "react-pdf-highlighter/build/style/PdfHighlighter.css";

import getBoundingRect from "react-pdf-highlighter/build/lib/get-bounding-rect";
import getClientRects from "react-pdf-highlighter/build/lib/get-client-rects";
import getAreaAsPng from "react-pdf-highlighter/build/lib/get-area-as-png";

import {
  asElement,
  getPageFromRange,
  getPageFromElement,
  getWindow,
  findOrCreateContainerLayer,
  isHTMLElement
} from "react-pdf-highlighter/build/lib/pdfjs-dom";

import TipContainer from './TipContainer';
import MouseSelection from "react-pdf-highlighter/build/components/MouseSelection";

import { scaledToViewport, viewportToScaled } from "react-pdf-highlighter/build/lib/coordinates";

const EMPTY_ID = "empty-id";

class PdfHighlighter extends PureComponent {
  
  static defaultProps = {
    pdfScaleValue: "auto"
  };

  state = {
    ghostHighlight: null,
    isCollapsed: true,
    range: null,
    ranges: [],
    scrolledToHighlightId: this.props.scroll_to_highlight_id_on_load,
    isAreaSelectionInProgress: false,
    tip: null,
    tipPosition: null,
    tipChildren: null
  };

  eventBus = new EventBus();
  
  linkService = new PDFLinkService({
    eventBus: this.eventBus
  });

  viewer: T_PDFJS_Viewer;

  resizeObserver = null;
  containerNode: ?HTMLDivElement = null;
  unsubscribe = () => {};

  constructor(props: Props<T_HT>) {
    super(props);
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.debouncedScaleValue);
    }
  }

  componentDidMount() {
    this.init();
  }

  attachRef = (ref: ?HTMLDivElement) => {
    const { eventBus, resizeObserver: observer } = this;
    this.containerNode = ref;
    this.unsubscribe();

    if (ref) {
      const { ownerDocument: doc } = ref;
      eventBus.on("textlayerrendered", this.onTextLayerRendered);
      eventBus.on("pagesinit", this.onDocumentReady);
      doc.addEventListener("selectionchange", this.onSelectionChange);
      doc.addEventListener("keydown", this.handleKeyDown);
      doc.defaultView.addEventListener("resize", this.debouncedScaleValue);
      if (observer) observer.observe(ref);

      this.unsubscribe = () => {
        eventBus.off("pagesinit", this.onDocumentReady);
        eventBus.off("textlayerrendered", this.onTextLayerRendered);
        doc.removeEventListener("selectionchange", this.onSelectionChange);
        doc.removeEventListener("keydown", this.handleKeyDown);
        doc.defaultView.removeEventListener("resize", this.debouncedScaleValue);
        if (observer) observer.disconnect();
      };
    }
  };

  componentDidUpdate(prevProps: Props<T_HT>) {
    if (prevProps.pdfDocument !== this.props.pdfDocument) {
      this.init();
      return;
    }
    if (prevProps.highlights !== this.props.highlights || 
      prevProps.selected_origin !== this.props.selected_origin ||
      prevProps.selected_target !== this.props.selected_target) {
      this.renderHighlights(this.props);
    }
  }

  init() {
    const { pdfDocument } = this.props;

    this.viewer =
      this.viewer ||
      new PDFViewer({
        container: this.containerNode,
        eventBus: this.eventBus,
        enhanceTextSelection: true,
        removePageBorders: true,
        linkService: this.linkService
      });

    this.linkService.setDocument(pdfDocument);
    this.linkService.setViewer(this.viewer);
    this.viewer.setDocument(pdfDocument);

    // debug
    window.PdfViewer = this;
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  findOrCreateHighlightLayer(page: number) {
    const { textLayer } = this.viewer.getPageView(page - 1) || {};

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.textLayerDiv,
      "PdfHighlighter__highlight-layer"
    );
  }

  groupHighlightsByPage(
    highlights: Array<T_HT>
  ): { [pageNumber: string]: Array<T_HT> } {
    const { ghostHighlight } = this.state;

    return [...highlights, ghostHighlight]
      .filter(Boolean)
      .reduce((res, highlight) => {
        const { pageNumber } = highlight.position;

        res[pageNumber] = res[pageNumber] || [];
        res[pageNumber].push(highlight);

        return res;
      }, {});
  }

  showTip(highlight: T_ViewportHighlight<T_HT>, content: React$Element<*>) {
    const {
      isCollapsed,
      ghostHighlight,
      isAreaSelectionInProgress
    } = this.state;

    const highlightInProgress = !isCollapsed || ghostHighlight;

    if (highlightInProgress || isAreaSelectionInProgress) {
      return;
    }

    this.setTip(highlight.position, content);
  }

  scaledPositionToViewport({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates
  }: T_ScaledPosition): T_Position {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map(rect =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber
    };
  }

  viewportPositionToScaled({
    pageNumber,
    boundingRect,
    rects
  }: T_Position): T_ScaledPosition {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
      pageNumber
    };
  }

  screenshot(position, pageNumber) {
    const canvas = this.viewer.getPageView(pageNumber - 1).canvas;

    return getAreaAsPng(canvas, position);
  }

  renderHighlights(nextProps) {
    const { highlightTransform, highlights, relations, scrollViewerToId} = nextProps || this.props;

    const { pdfDocument } = this.props;

    const { tip, scrolledToHighlightId } = this.state;

    // console.log("Highlights are:", highlights);

    let flattened_highlights = (highlights || []).flatMap(({ position, id, ...highlight }, index) => {

      let rebuilt_highlights = [];
      
      if (Array.isArray(position)) {
        
        for (var i=0; i<position.length; i++) {
          rebuilt_highlights.push({
            id, 
            sub_part: i,
            position: position[i],
            ...highlight
          })
        }
      }
      else {
        rebuilt_highlights.push({
          position, 
          id,
          sub_part: 0,
          ...highlight
        });
      }

      return rebuilt_highlights;

    });

    // console.log("Flattened highlights", flattened_highlights);
    //const highlightsByPage = this.groupHighlightsByPage(highlights);
    const highlightsByPage = this.groupHighlightsByPage(flattened_highlights);

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = this.findOrCreateHighlightLayer(pageNumber);

      if (highlightLayer) {
        ReactDom.render(
          <div>
            {(highlightsByPage[String(pageNumber)] || []).map(
              ({ position, id, ...highlight }, index) => {
                
                const viewportHighlight = {
                  id,
                  position: this.scaledPositionToViewport(position),
                  ...highlight
                };

                const to_relations = relations.filter((relation) => relation.fromId === id);
                const from_relations = relations.filter((relation) => relation.targetId === id)

                if (tip && tip.highlight.id === String(id)) {
                  this.showTip(tip.highlight, tip.callback(viewportHighlight));
                }

                const isScrolledTo = Boolean(scrolledToHighlightId === id);

                return highlightTransform(
                  to_relations,
                  from_relations,
                  scrollViewerToId,
                  viewportHighlight,
                  index,
                  (highlight, callback) => {
                    this.setState({
                      tip: { highlight, callback }
                    });

                    this.showTip(highlight, callback(highlight));
                  },
                  this.hideTipAndSelection,
                  rect => {
                    const viewport = this.viewer.getPageView(pageNumber - 1)
                      .viewport;

                    return viewportToScaled(rect, viewport);
                  },
                  boundingRect => this.screenshot(boundingRect, pageNumber),
                  isScrolledTo
                );
              }
            )}
          </div>,
          highlightLayer
        );
      }
    }
  }

  hideTipAndSelection = () => {
    this.setState({
      tipPosition: null,
      tipChildren: null
    });

    this.setState({ ghostHighlight: null, tip: null }, () =>
      this.renderHighlights()
    );
  };

  setTip(position, inner) {
    this.setState({
      tipPosition: position,
      tipChildren: inner
    });
  }

  renderTip = () => {
    const { tipPosition, tipChildren } = this.state;
    if (!tipPosition) return null;

    const { boundingRect, pageNumber } = tipPosition;
    const page = {
      node: this.viewer.getPageView(pageNumber - 1).div
    };

    return (
      <TipContainer
        scrollTop={this.viewer.container.scrollTop}
        pageBoundingRect={page.node.getBoundingClientRect()}
        style={{
          left:
            page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
          top: boundingRect.top + page.node.offsetTop,
          bottom: boundingRect.top + page.node.offsetTop + boundingRect.height
        }}
      >
        {tipChildren}
      </TipContainer>
    );
  };

  onTextLayerRendered = () => {
    this.renderHighlights();
  };

  scrollTo = (highlight) => {

    // console.log("Scroll to: ", highlight);

    let position = {};
    if (highlight && highlight.position && Array.isArray(highlight.position)) {
      position = highlight.position[0]; // Always jump to the first part of the highlight.
    }
    else {
      position = highlight.position; // Always jump to the first part of the highlight.
    }
    const { pageNumber, boundingRect, usePdfCoordinates } = position; // Always jump to the first part of the highlight.


    this.viewer.container.removeEventListener("scroll", this.onScroll);

    const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;

    const scrollMargin = 10;

    this.viewer.scrollPageIntoView({
      pageNumber,
      destArray: [
        null,
        { name: "XYZ" },
        ...pageViewport.convertToPdfPoint(
          0,
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin
        ),
        0
      ]
    });

    this.setState(
      {
        scrolledToHighlightId: highlight.id
      },
      () => this.renderHighlights()
    );

    // wait for scrolling to finish
    setTimeout(() => {
      this.viewer.container.addEventListener("scroll", this.onScroll);
    }, 100);
  };

  onDocumentReady = () => {

    const { scrollRef, scroll_to_highlight_id_on_load } = this.props;

    this.handleScaleValue();

    scrollRef(this.scrollTo);

    // If this was passed in, try to scroll to that id on load
    if (scroll_to_highlight_id_on_load) {
      this.props.scrollViewerToId(scroll_to_highlight_id_on_load);
    }

  };

  onSelectionChange = () => {

    const container = this.containerNode;
    const selection = getWindow(container).getSelection();
    let ranges = [];

    // console.log("Selection is ", selection);
    for (var i=0; i<selection.rangeCount; i++) {
      ranges.push(selection.getRangeAt(i));
      // console.log(`We have selection range ${i}: `, selection.getRangeAt(i));
    }
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    

    if (selection.isCollapsed) {
      this.setState({ isCollapsed: true });
      return;
    }

    if (
      !range ||
      !container ||
      !container.contains(range.commonAncestorContainer)
    ) {
      return;
    }

    //Move from using a single range to a series of ranges... with the ability to store markups as array of pages and rectangles for a given annotation.
    this.setState({
      isCollapsed: false,
      range, 
      ranges
    });

    this.debouncedAfterSelection();
  };

  onScroll = () => {

    const { onScrollChange } = this.props;

    onScrollChange();

    this.setState(
      {
        scrolledToHighlightId: EMPTY_ID
      },
      () => this.renderHighlights()
    );

    this.viewer.container.removeEventListener("scroll", this.onScroll);
  };

  onMouseDown = (event) => {
    if (!isHTMLElement(event.target)) {
      return;
    }

    if (asElement(event.target).closest(".PdfHighlighter__tip-container")) {
      return;
    }

    this.hideTipAndSelection();
  };

  handleKeyDown = (event) => {
    if (event.code === "Escape") {
      this.hideTipAndSelection();
    }
  };

  // Developed this as a way to get saner output of the pdf.js highlights... requires a little hackery and 
  // probably will break in some situations. But it a) inserts spaces between new lines (not the case by 
  // default in pdf.js) and b) cleans long runs of spaces that pdfs / pdf.js sometime use for positioning.
  RangeToStringCustom = (range) => {

    var _iterator = document.createNodeIterator(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ALL, // pre-filter SHOW_ALL
      {
          // custom filter
          acceptNode: function (node) {
              return NodeFilter.FILTER_ACCEPT;
          }
      }
    );
    
    var _nodes = [];
    let last_y = null;
    let text = "";

    while (_iterator.nextNode()) {

        // Don't do anything before we reach the startContainer, as the method the pdf annotator library takes zooms out to parent and
        // then iterates over the children, which likely include nodes before the actual selected text.
        if (_nodes.length === 0 && _iterator.referenceNode !== range.startContainer) continue;
        _nodes.push(_iterator.referenceNode);

        // console.log("Handle node:");
        console.log(_iterator.referenceNode);
        // console.log("OffsetTop: ", _iterator.referenceNode.offsetTop);  
        // console.log("Node type");
        console.log(_iterator.referenceNode.nodeType);

        let y_pos = null;
        // If node is a text node
        if (_iterator.referenceNode.nodeType === 3) {
          // Text nodes should be children of span and we need span to get offsetTop to detect new lines
          y_pos = _iterator.referenceNode.parentNode.offsetTop; 
        }
        // If it's an element node (though, FYI this # doesn't match # in Mozilla MDN, so not 100% on what nodeType this actually is)
        // It's working for now, so rolling with it.
        if (_iterator.referenceNode.nodeType === 1) {
          // If this is likely a span, we can just get the offsetTop of the node itself.
          y_pos = _iterator.referenceNode.offsetTop;
        } 
        
        // Now check to see if lines have changed
        if (!last_y) {
          // console.log("First line, set last_y to this line but add no space.");
          last_y = y_pos;
        } 
        else if (y_pos && y_pos !== last_y) {
          // console.log("Line change detected");
          text = text + " ";
          last_y = y_pos;
        }

        // Handle node at start of range (can't be picky unfortunately it can be text or object)
        if (_iterator.referenceNode === range.startContainer) {
                  
          // console.log("Start container offset", range.startOffset);
          
          if (_iterator.referenceNode.textContent) {
            // console.log("Node has text content", _iterator.referenceNode.textContent);
            // console.log("Text to add is: ", _iterator.referenceNode.textContent.substring(range.startOffset, _iterator.referenceNode.textContent.length));
            text = text + _iterator.referenceNode.textContent.substring(range.startOffset, _iterator.referenceNode.textContent.length);
          }

          continue;
          
        }

        // If we reach the startContainer and it's the same as the end container... we need to substring both the startOffset and 
        // endOffset values for the range as the range is clearly a single node and these offsets thus also apply to the same node 
        if (_iterator.referenceNode === range.startContainer && range.startContainer.isSameNode(range.endContainer)) {
          
          // console.log("Start container and end container are identical.")
          // console.log("Start container offset", range.startOffset);
          // console.log("End container offset", range.endOffset);

          if (_iterator.referenceNode.textContent) {
            // console.log("Node has text content", _iterator.referenceNode.textContent);
            // console.log("Text to add is: ", _iterator.referenceNode.textContent.substring(range.startOffset, range.endOffset));
            text = _iterator.referenceNode.textContent.substring(range.startOffset, range.endOffset);
          }
          else {}

          break; // nothing else to do in this case
        }

        // Handle node at end of range (can't be picky unfortunately it can be text or object)
        if (_iterator.referenceNode === range.endContainer) {

          // console.log("End container reached");
          // console.log("Start container offset", range.endOffset);
          if (_iterator.referenceNode.textContent) {

            // console.log("Node has text content", _iterator.referenceNode.textContent);
            // console.log("Text to add is: ", _iterator.referenceNode.textContent.substring(0, range.endOffset));
            text = text + _iterator.referenceNode.textContent.substring(0, range.endOffset);

          }
          break;
        }
        
        // Otherwise, just look for text nodes... this is avoids getting both the span and inner text node and duplicating text
        if (_iterator.referenceNode.nodeType===3 && _iterator.referenceNode.textContent) {
          text = text + _iterator.referenceNode.textContent;   
        }
    }

    // Due to the way pdfs can be laid / how pdf.js is rendering, there can be obnoxiously long white space sections... sooooooo
    // Use a quick and dirty (but apparently effective method to clean text. Just remove whiteapce globally and trim start or end white space)
    text = text.replace(/\s+/g, ' ').trim();
    return text;

  }

  buildAnnotationJson = () => {

    const { ranges } = this.state;

    if (!ranges || ranges.length === 0) {
      return;
    }

    let annotations = [];
    let content = "";
    let first_page = 0;

    for (var i=0; i<ranges.length; i++) {

      const range = ranges[i];
      // console.log(`Range ${i} is`, ranges[i]);
      // console.log("Text is: ",  window.getSelection().toString());
      console.log(this.RangeToStringCustom(ranges[i]));
      const page = getPageFromRange(range);
      if (i === 0) first_page = page.pageNumber;

      if (page) {
        const rects = getClientRects(range, page.node);
        if (rects.length > 0) {
          
          const boundingRect = getBoundingRect(rects);
          const viewportPosition = { boundingRect, rects, pageNumber: page.number };
          const scaledPosition = this.viewportPositionToScaled(viewportPosition);
          
          annotations.push(scaledPosition);
          content += this.RangeToStringCustom(range);

        }
      }
    }
    
    return { first_page, content, annotations };

  }

  afterSelection = () => {
    const { onSelectionFinished } = this.props;

    const { isCollapsed, range } = this.state;

    // Going to switch from range to *ranges* to permit cross-page hightlights
    if (!range || isCollapsed) {
      return;
    }

    const page = getPageFromRange(range);

    if (!page) {
      return;
    }

    const rects = getClientRects(range, page.node);

    if (rects.length === 0) {
      return;
    }

    const boundingRect = getBoundingRect(rects);

    const viewportPosition = { boundingRect, rects, pageNumber: page.number };

    // console.log("After selection, range is: ", range);
    // console.log("Range type is: ", typeof(range));

    const content = {
      text: range.toString()
    };
    const scaledPosition = this.viewportPositionToScaled(viewportPosition);

    let annotations = this.buildAnnotationJson();
    // console.log("New style annotations: ", annotations);

    this.setTip(
      viewportPosition,
      onSelectionFinished(
        scaledPosition,
        content,
        () => this.hideTipAndSelection(),
        () =>
          this.setState(
            {
              ghostHighlight: { position: scaledPosition }
            },
            () => this.renderHighlights()
        ),
        annotations
      )
    );
  };

  debouncedAfterSelection: () => void = debounce(this.afterSelection, 500);

  toggleTextSelection(flag) {
    this.viewer.viewer.classList.toggle(
      "PdfHighlighter--disable-selection",
      flag
    );
  }

  handleScaleValue = () => {
    if (this.viewer) {
      this.viewer.currentScaleValue = this.props.pdfScaleValue;
    }
  };

  debouncedScaleValue: () => void = debounce(this.handleScaleValue, 500);

  render() {
    const { onSelectionFinished, enableAreaSelection } = this.props;

    return (
      <Pointable onPointerDown={this.onMouseDown}>
        <div
          ref={this.attachRef}
          className="PdfHighlighter"
          onContextMenu={e => e.preventDefault()}
        >
          <div className="pdfViewer" />
          {this.renderTip()}
          {typeof enableAreaSelection === "function" ? (
            <MouseSelection
              onDragStart={() => this.toggleTextSelection(true)}
              onDragEnd={() => this.toggleTextSelection(false)}
              onChange={isVisible =>
                this.setState({ isAreaSelectionInProgress: isVisible })
              }
              shouldStart={event =>
                enableAreaSelection(event) &&
                isHTMLElement(event.target) &&
                Boolean(asElement(event.target).closest(".page"))
              }
              onSelection={(startTarget, boundingRect, resetSelection) => {
                const page = getPageFromElement(startTarget);

                if (!page) {
                  return;
                }

                const pageBoundingRect = {
                  ...boundingRect,
                  top: boundingRect.top - page.node.offsetTop,
                  left: boundingRect.left - page.node.offsetLeft
                };

                const viewportPosition = {
                  boundingRect: pageBoundingRect,
                  rects: [],
                  pageNumber: page.number
                };

                const scaledPosition = this.viewportPositionToScaled(
                  viewportPosition
                );

                const image = this.screenshot(pageBoundingRect, page.number);

                this.setTip(
                  viewportPosition,
                  onSelectionFinished(
                    scaledPosition,
                    { image },
                    () => this.hideTipAndSelection(),
                    () =>
                      this.setState(
                        {
                          ghostHighlight: {
                            position: scaledPosition,
                            content: { image }
                          }
                        },
                        () => {
                          resetSelection();
                          this.renderHighlights();
                        }
                      )
                  )
                );
              }}
            />
          ) : null}
        </div>
      </Pointable>
    );
  }
}

export default PdfHighlighter;
