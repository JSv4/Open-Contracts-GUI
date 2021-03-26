// @flow
/* eslint import/no-webpack-loader-syntax: 0 */

import React, { PureComponent } from "react";
import PDFWorker from "worker-loader!pdfjs-dist/lib/pdf.worker";

import {
  PdfLoader,
  Popup,
  AreaHighlight,
  setPdfWorker, 
} from "react-pdf-highlighter";

import _ from 'lodash';

import { Label, Modal } from 'semantic-ui-react';

import { VerticallyCenteredDiv, HorizontallyCenteredDiv } from '../shared/layouts/Wrappers';

import PdfHighlighter from './PdfHighlighter';
import Tip from './Tip';
import Highlight from "./Highlight";
import Spinner from "./Spinner";
import AnnotatorSidebar from "./AnnotatorSidebar";

import "../../assets/style/Annotator.css";
import NewRelationshipModal from "./NewRelationshipModal";

import Cursor from "./Cursor";

setPdfWorker(PDFWorker);

const getNextId = () => String(Math.random()).slice(2);


const HighlightPopup = ({ highlight, to_relations, from_relations, scrollViewerToId }) => {
  
  let {comment} = highlight;
  let toLabels = to_relations.map(relation => 
    <Label color='green' as="a" size='mini' key={relation.id} onClick={() => scrollViewerToId(relation.targetId)}>
      {relation.label}
    <Label.Detail>{"-->"} LABEL</Label.Detail>
  </Label>);
  let fromLabels = from_relations.map(relation =>
    <Label color='red' as="a" size='mini' key={relation.id} onClick={() => scrollViewerToId(relation.fromId)}>
      {relation.label}
    <Label.Detail>{"<--"} BY</Label.Detail> 
    </Label>);

  return (
        comment?.text ? (
        <div className="Highlight__popup">
          <VerticallyCenteredDiv>
            <HorizontallyCenteredDiv>
              <div>
                <strong>LABEL:</strong> <i>{comment.text}</i>
                <hr size="5"/>
              </div>
            </HorizontallyCenteredDiv>
            { toLabels.length > 0 || fromLabels.length > 0 ? 
              <HorizontallyCenteredDiv>
                <VerticallyCenteredDiv>
                  <HorizontallyCenteredDiv>
                    {toLabels}
                    {fromLabels}
                  </HorizontallyCenteredDiv>
                </VerticallyCenteredDiv>
            </HorizontallyCenteredDiv> : <></>}
          </VerticallyCenteredDiv>
        </div>
      ) : null);
};

const DELETE_KEY = 46;
const ESCAPE_KEY = 27;
const LEFT_SHIFT_KEY = 16;
const LEFT_CTRL_KEY = 17;

class Annotator extends PureComponent {
  
  constructor(props) {
    super(props);
    this.state = {
      url: this.props.url,
      canSave: false,
      selected_highlight: null,
      selected_target: null,
      selected_origin: null,
      left_shift_key_down: false,
      left_ctrl_key_down: false,
      show_relationship_modal: false,
      highlights: this.props.labels ? this.props.labels : [],
      relations: this.props.relations ? this.props.relations : []
    };
  }

  toggleRelationshipModal = () => {
    this.setState({
      show_relationship_modal: !this.state.show_relationship_modal
    });
  }

  _handleKeyDown = (event) => {
    switch( event.keyCode ) {
        case DELETE_KEY:
          if (this.state.selected_highlight) {
            this.deleteHighlightById(this.state.selected_highlight);
          }
          break;
        case LEFT_SHIFT_KEY:
          this.setState({
            left_shift_key_down: true
          });
          event.stopPropagation();
          break;
        case LEFT_CTRL_KEY:
          this.setState({
            left_ctrl_key_down: true
          });
          event.stopPropagation();
          break;
        case ESCAPE_KEY:
          this.setState({
            selected_target: null,
            selected_origin: null,
            selected_highlight: null,
          });
        default:
          console.log("Key press", event.keyCode); 
          break;
    }
  };

  _handleKeyUp = (event) => {
    switch( event.keyCode ) {
        case LEFT_SHIFT_KEY:
          this.setState({
            left_shift_key_down: false
          });
          event.stopPropagation();
          break;
        case LEFT_CTRL_KEY:
          this.setState({
            left_ctrl_key_down: false
          });
          event.stopPropagation();
          break;
        default: 
          console.log("key unpress", event.keyCode);
            break;
    }
  };

  toggleHighlight = (id, scroll_to=true) => {

    console.log("toggleHighlight", id, scroll_to);

    const { selected_highlight, selected_target, selected_origin, left_shift_key_down, left_ctrl_key_down } = this.state;
    const highlight = this.getHighlightById(id); // this is returning null
    
    // Unselect highlight if already selected
    if (left_shift_key_down) {
      if ( selected_target === id ) {
        this.setState({
          selected_target: null
        }, () => scroll_to ? this.scrollViewerTo(highlight) : {});
      }   
      else if ( selected_target !== id) {
        this.setState({
          selected_target: id, 
          show_relationship_modal: Boolean(this.state.selected_origin)
        }, () => scroll_to ? this.scrollViewerTo(highlight) : {});
      }
    }
    else if (left_ctrl_key_down) {
      if (selected_origin === id) {
        this.setState({
          selected_origin: null
        }, () => scroll_to ? this.scrollViewerTo(highlight) : {});
      }   
      else if (selected_origin !== id) {
        this.setState({
          selected_origin: id,
          show_relationship_modal: Boolean(this.state.selected_target)
        }, () => scroll_to ? this.scrollViewerTo(highlight) : {});
      }
    }
    else {
      if (selected_highlight === id) {
        // console.log("Unselect origin highlight");
        this.setState({
          selected_highlight: null,
          selected_origin: null,
          selected_target: null,
        }, () => scroll_to ? this.scrollViewerTo(highlight) : {});
      }   
      else if (selected_highlight !== id) {
        // console.log("Select origin highlight");
        this.setState({
          selected_highlight: id,
          selected_origin: null,
          selected_target: null,
        }, () => scroll_to ? this.scrollViewerTo(highlight) : {});
      }
    }
  }

  resetHighlights = () => {
    this.setState({
      highlights: [],
      canSave: false
    });
  };

  scrollViewerTo = (highlight) => {
    console.log("Scroll viewer to", highlight);
    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  scrollViewerToId = (id) => {

    console.log("scrollViewerToId:", id);

    if (this.getHighlightById(id)) {
      let highlight = this.getHighlightById(id);
      console.log("Highlight is: ", highlight);
      this.scrollViewerTo(highlight);
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown);
    document.addEventListener('keyup', this._handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('keyup', this._handleKeyUp);
  }

  getHighlightById = (id) => {
    console.log("getHighlightById...");
    let highlight = _.find(this.props.document_labelled_text, {id});
    console.log("Highlight", highlight);
    return highlight;
  }

  deleteHighlightById = (id) => {
    console.log("Delete highlight by id", id);
    this.props.deleteAnnotation(id);
  }

  deleteRelationById = (id) => {
    console.log("Delete relation by id", id);
    this.props.deleteRelation(id);
  }

  addHighlight = (highlight) => {
    const { highlights } = this.state;

    console.log("Saving highlight", highlight);

    let annotation_json = {
      label_json: highlight,
      label: highlight.comment.id,
      document: this.props.document_id,
      corpus: this.props.corpus_id,
      page: highlight.annotations.first_page,
      type: highlight.comment.type,
      position: highlight.annotations.annotations,
      text: highlight.annotations.content
    };
    
    console.log("Annotation json for server ", annotation_json);
    this.props.createAnnotation(annotation_json);

    this.setState({
      highlights: [{ ...highlight, id: getNextId() }, ...highlights],
      canSave: true
    });

  }

  addRelation = (relation) => {
    const { relations } = this.state;

    console.log("Saving relation", relation);

    this.props.createRelation({
      type:"RELATIONSHIP_LABEL",
      target_annotation: relation.targetId, 
      source_annotation: relation.fromId,
      corpus: this.props.corpus_id,
      label: relation.label,
    });

    this.setState({
      relations: [{ ...relation, id: getNextId() }, ...relations],
      canSave: true
    });
  }

  saveAnnotations = () => {
    this.props.onSave({
      relations: this.state.relations,
      labels: this.state.highlights,
    });

    this.setState({
      canSave: false
    });
  }

  updateHighlight = (highlightId, position, content) => {
    console.log("Updating highlight", highlightId, position, content);

    this.setState({
      canSave: true,
      highlights: this.state.highlights.map(h => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest
            }
          : h;
      })
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.labels !== this.props.labels ) {
        this.setState({
          highlights: this.props.labels,
          canSave: false
        });
    }
    if (prevProps.relations !== this.props.relations ) {
      this.setState({
        relations: this.props.relations,
        canSave: false
      });
    }
    if (prevProps.url !== this.props.url ) {
      this.setState({
        url: this.props.url
      });
    }
    if ((prevProps.open_on_annotation_id !== this.props.open_on_annotation_id) 
          && this.props.open_on_annotation_id) {
            console.log("Scroll viewer to id: ", this.props.open_on_annotation_id);
          this.scrollViewerToId(this.props.open_on_annotation_id);
    }
  }

  render() {

    const { 
      url,
      canSave,
      relations,
      selected_highlight,
      selected_origin,
      selected_target,
      show_relationship_modal,
      left_shift_key_down,
      left_ctrl_key_down
    } = this.state;

    const {
      label_set_labels,
      document_labelled_text,
      document_label_relations,
      open,
      read_only,
      toggleModal,
    } = this.props;

    let { REACT_APP_ALLOW_RELATIONS } = process.env;

    let text_label_choices = _.filter(label_set_labels, {type: "TEXT_LABEL"});
    let relation_label_choices = _.filter(label_set_labels, {type: "RELATIONSHIP_LABEL"});

    let text_annotations = _.filter(document_labelled_text, {type: "TEXT_LABEL"}).map((annotation)=> {
        let comment = _.find(text_label_choices, {id: annotation.label.id});
        return {
          id: annotation.id,
          content: {
            text: annotation.text
          },
          comment: comment ? {text: comment.label, icon: comment.icon, color: comment.color} : {},
          position: annotation.position
        };
    });
    let relation_annotations = _.filter(document_label_relations, {type: "RELATIONSHIP_LABEL"}).map((relation) => {
      
      let label =  _.find(relation_label_choices, {id: relation.label});
      return {
        id: relation.id,
        fromId: relation.source_annotation,
        label: label.label,
        targetId: relation.target_annotation
      };

    });

    return (
      <Modal
        closeIcon
        onClose={() => toggleModal()}
        open={open}
        style={{width:'90vw', height: '90vh'}}
      >
        <div className="Annotator">
          {
            REACT_APP_ALLOW_RELATIONS ?  
            <NewRelationshipModal
              highlights={text_annotations ? text_annotations : []}
              origin={selected_origin}
              target={selected_target}
              selected_highlight={selected_highlight}
              visible={show_relationship_modal}
              toggleModal={this.toggleRelationshipModal}
              onCreate={this.addRelation}
              relation_labels={relation_label_choices}
            /> :
            <></>
          }
          <AnnotatorSidebar
            canSave={canSave}
            read_only={read_only}
            highlights={text_annotations ? text_annotations : []}
            relations={relation_annotations}
            selected_highlight={selected_highlight}
            resetHighlights={this.resetHighlights}
            toggleDocument={this.toggleDocument}
            toggleHighlight={this.toggleHighlight}
            scrollViewerTo={this.scrollViewerTo}
            scrollViewerToId={this.toggleHighlight}
            deleteHighlightById={this.deleteHighlightById}
            deleteRelationById={this.deleteRelationById}
            onSave={this.saveAnnotations}
          />
          {!read_only && REACT_APP_ALLOW_RELATIONS ? <Cursor target={left_shift_key_down} source={left_ctrl_key_down}/> : <></>}
          <div
            style={{
              height: "100%",
              width: "75vw",
              position: "relative"
            }}
          >
              <PdfLoader url={url} beforeLoad={<Spinner />}>
                {pdfDocument => (
                  <PdfHighlighter
                    key={url}
                    pdfDocument={pdfDocument}
                    enableAreaSelection={event => event.altKey}
                    onScrollChange={(data) => console.log("On scroll change: ", data)}
                    scrollRef={scrollTo => {
                      this.scrollViewerTo = scrollTo;
                    }}
                    scrollViewerToId={this.toggleHighlight}
                    selected_highlight={selected_highlight}
                    selected_origin={selected_origin}
                    selected_target={selected_target}
                    scroll_to_highlight_id_on_load={this.props.open_on_annotation_id}
                    onSelectionFinished={(
                      position,
                      content,
                      hideTipAndSelection,
                      transformSelection,
                      annotations,
                    ) => (
                      <Tip
                        read_only={read_only}
                        label_set={text_label_choices}
                        onOpen={transformSelection}
                        content={content}
                        onConfirm={comment => {
                          this.addHighlight({ content, position, comment, annotations });
                          hideTipAndSelection();
                        }}
                      />
                    )}
                    highlightTransform={(
                      to_relations,
                      from_relations,
                      scrollViewerToId,
                      highlight,
                      index,
                      setTip,
                      hideTip,
                      viewportToScaled,
                      screenshot,
                    ) => {
                      const isTextHighlight = !Boolean(
                        highlight.content && highlight.content.image
                      );

                      const component = isTextHighlight ? (
                        <Highlight
                          selected={selected_highlight===highlight.id}
                          origin={selected_origin===highlight.id}
                          target={selected_target===highlight.id}
                          position={highlight.position}
                          comment={highlight.comment}
                          onClick={() => this.toggleHighlight(highlight.id, false)}
                          onLink={this.toggleRelationshipModal}
                        />
                      ) : (
                        <AreaHighlight
                          highlight={highlight}
                          onChange={boundingRect => {
                            this.updateHighlight(
                              highlight.id,
                              { boundingRect: viewportToScaled(boundingRect) },
                              { image: screenshot(boundingRect) }
                            );
                          }}
                        />
                      );

                      return (
                        <Popup
                          popupContent={<HighlightPopup highlight={highlight} to_relations={to_relations} from_relations={from_relations} scrollViewerToId={scrollViewerToId} />}
                          onMouseOver={popupContent =>
                            setTip(highlight, highlight => popupContent)
                          }
                          onMouseOut={hideTip}
                          key={index}
                          children={component}
                        />
                      );
                    }}
                    highlights={text_annotations ? text_annotations : []}
                    relations={relations ? relations : []}
                  />
                )}
              </PdfLoader>
          </div>
        </div>
      </Modal>
    );
  }
}

export default Annotator;
