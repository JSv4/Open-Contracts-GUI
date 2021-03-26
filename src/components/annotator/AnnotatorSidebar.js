// @flow

import React from "react";
import { 
  Icon, 
  Label,
  Button,
  Popup,
  Tab,
  Card,
  Divider,
  Segment
} from 'semantic-ui-react';
import { HorizontallyJustifiedDiv } from '../shared/layouts/Wrappers';
import _ from 'lodash';

function HighlightItem({
  reference,
  index,
  read_only,
  highlight,
  highlights,
  highlight_relations,
  selected_highlight,
  color,
  divided,
  toggleHighlight,
  deleteHighlightById,
  scrollViewerToId}) {

  let label_relations = <></>;
  label_relations = highlight_relations ? label_relations = highlight_relations.map(relation => {

    let target = _.find(highlights, {id: relation.targetId});

    return <Popup key={relation.id} trigger={<Label id={relation.id} ><Icon name='cancel' />{relation.label}</Label>}
            flowing hoverable>
              <span><strong>Relationship:</strong></span>
              <div>
                <Button onClick={() => {
                  // console.log("Jump to", target);
                  scrollViewerToId(target.id);
                }}>Show</Button>
                {!read_only ? <Button onClick={() => console.log("Delete", relation.id)}>Delete</Button> : <></>}
              </div>           
            </Popup>;
  }) : <></>;

  return <div
          ref={reference}
          key={index}
          style={ selected_highlight === highlight.id ? {border: `2px solid ${color}` } : divided ? {} : {borderBottom: '0px'}}
          className="sidebar__highlight"
        >
          <div>
            <div>
            {highlight?.comment?.text ? 
              <Label
                onClick={() => {
                  // console.log("Highlight", highlight);
                  toggleHighlight(highlight.id);
                }}
                style={{ color: highlight.comment.color ? highlight.comment.color : 'grey'}}>
                {highlight.comment.icon ? <Icon name={highlight.comment.icon} /> : <></>}
                <strong>{highlight.comment.text}</strong>
              </Label> : <></>}
            {deleteHighlightById && !read_only ? <Button circular icon='trash' floated='right' color='red' onClick={() => deleteHighlightById(highlight.id)}/> : <></>}
            {highlight?.content?.text ? (
              <Popup 
                content={highlight.content.text}
                trigger={ 
                  <blockquote style={{ marginTop: "0.5rem" }}>
                    {`${highlight.content.text.slice(0, 90).trim()}…`}
                  </blockquote>
              }/>
            ) : null}
            {highlight?.content?.image ? (
              <div
                className="highlight__image"
                style={{ marginTop: "0.5rem" }}
              >
                <img src={highlight.content.image} alt={"Screenshot"} />
              </div>
            ) : null}
          </div>
          <HorizontallyJustifiedDiv>
            {label_relations ? <div>{label_relations}</div> : <></>}
            { highlight && highlight.position && Array.isArray(highlight.position) ? <div className="highlight__location">
              Page {highlight.position[0].pageNumber}
            </div> : <></>}
          </HorizontallyJustifiedDiv>
        </div>
    </div>
}

function RelationItem({
  index,
  origin_highlight,
  target_highlight,
  selected_highlight,
  toggleHighlight,
  relation,
  scrollViewerTo,
  scrollViewerToId,
  onDelete,
  read_only
}) {
    
  return (
    <Card fluid raised>
      <Label corner='right' icon='trash' color='red' onClick={() => onDelete()}/>
        <HighlightItem
          index={`1_${index}`}
          highlight={origin_highlight}
          selected_highlight={selected_highlight}
          color={origin_highlight.comment.color ? origin_highlight.comment.color : "teal"}
          toggleHighlight={toggleHighlight}
          scrollViewerTo={scrollViewerTo}
          scrollViewerToId={scrollViewerToId}
          read_only={read_only}
        />
        <Divider horizontal><strong>{relation.label}:</strong></Divider>
        <HighlightItem
          index={`2_${index}`}
          highlight={target_highlight}
          selected_highlight={selected_highlight}
          color={target_highlight.comment.color ? target_highlight.comment.color : "teal"}
          toggleHighlight={toggleHighlight}
          scrollViewerTo={scrollViewerTo}
          scrollViewerToId={scrollViewerToId}
          read_only={read_only}
        />
    </Card>
  )
}

class AnnotatorSidebar extends React.Component {

  // Following this approach to implement scroll to child: 
  //  https://www.robinwieruch.de/react-scroll-to-item
  constructor(props, context) {
    super(props, context);

    this.itemRefs = {};
  }

  scrollSidebarToHighlightId = (id) => {
    this.itemRefs[id].current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  componentDidMount() {
   
    // console.log("Item refs on mount");
    // console.log(this.itemRefs);

     if (this.props.selected_highlight) {
        // console.log("componentDidMount, try scroll to...", this.props.selected_highlight);
        this.scrollSidebarToHighlightId(this.props.selected_highlight);
    }

  }

  componentDidUpdate(prevProps) {
    if (this.props.selected_highlight &&
      (this.props.selected_highlight !== prevProps.selected_highlight)) {
        // console.log("componentDidUpdate() - Try scroll to...", this.props.selected_highlight);
        this.scrollSidebarToHighlightId(this.props.selected_highlight);
    }
  }

  render () {
    let { relations,
      scrollViewerTo,
      scrollViewerToId,
      highlights,
      selected_highlight,
      toggleHighlight,
      deleteHighlightById,
      deleteRelationById,
      onSave,
      onBack,
      canSave,
      read_only
    } = this.props;

    // console.log("selected_highlight is", selected_highlight);

    let text_highlight_elements = []
  
    if (highlights) {

    text_highlight_elements = _.orderBy(highlights,  highlight => {
      if (highlight.position && Array.isArray(highlight.position) && highlight.position.length>0) {
        return highlight.position[0].pageNumber;
      }
      else {
        return 0;
      }
    }).map((highlight, index) => {
    
      let highlight_relations = relations ? relations.filter(relations => relations.from === highlight.id) : [];
      let border_color = highlight.comment.color ? highlight.comment.color : "teal";

      this.itemRefs[highlight.id] = React.createRef();

      return <HighlightItem
                key={index}
                reference={this.itemRefs[highlight.id]}
                index={index}
                divided
                highlight={highlight}
                highlights={highlights}
                highlight_relations={highlight_relations}
                selected_highlight={selected_highlight}
                color={border_color}
                toggleHighlight={toggleHighlight}
                deleteHighlightById={deleteHighlightById}
                scrollViewerTo={scrollViewerTo}
                scrollViewerToId={scrollViewerToId}
                read_only={read_only}
              />
     });
  }

  let relation_elements = relations?.map((relation, index) => {
    
    let origin_highlight = _.find(highlights, {id: relation.fromId});
    let target_highlight = _.find(highlights, {id: relation.targetId});

    if (!origin_highlight || !target_highlight) return <></>

    return <RelationItem
              key={index}
              index={index}
              origin_highlight={origin_highlight}
              target_highlight={target_highlight}
              selected_highlight={selected_highlight}
              toggleHighlight={toggleHighlight}
              relation={relation}
              scrollViewerTo={scrollViewerTo}
              scrollViewerToId={scrollViewerToId}
              onDelete={() => deleteRelationById(relation.id)}
              read_only={read_only}
            />;

  });
  
  let { REACT_APP_ALLOW_RELATIONS } = process.env;

  console.log("REACT_APP_ALLOW_RELATIONS", REACT_APP_ALLOW_RELATIONS);

  const panes = [
  {
    menuItem: 'Labels',
    render: () => 
    (<Tab.Pane key={1} style={{overflowY:'scroll', padding: '1em', width:'100%', flex: 1}}>
        <ul className="sidebar__highlights">
          {text_highlight_elements}
        </ul>
      </Tab.Pane>)
  }];
    
  if (REACT_APP_ALLOW_RELATIONS===true) {
    console.log("REACT_APP_ALLOW_RELATIONS if statement: ", REACT_APP_ALLOW_RELATIONS);
    panes.push({
      menuItem: 'Relationships',
      render: () => (
        <Tab.Pane key={2} style={{overflowY:'scroll', margin: '0px', width:'100%', flex: 1}}>
          <Card.Group key={2}>
            {relation_elements}
          </Card.Group>
        </Tab.Pane>
      ),
    });
  }

  return (
      <Segment style={{
        width: '25vw',
        height:'100%',
        padding:'0px',
        display:'flex',
        margin:'0px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}>
        {onBack ? <Label corner='left' icon="reply" color='blue' onClick={() => onBack()}/> : <></> }
        {onSave && canSave ? <Label corner='right' icon='save' color='green' onClick={() => onSave()}/> : <></>}
        <div style={{width: '100%', textAlign: 'center'}}>
          <div style={{width: '100%', marginTop: '1rem'}}>
            <h2 style={{ marginBottom: "1rem" }}>Document Annotations</h2>
          </div>
          <div style={{width: '100%'}}>
            {!read_only ? <p>
              <small>
                To create a highlight, drag to select the desired text. A popup will ask you to select the proper label.
              </small>
            </p> : <></>}
          </div>
        </div>
        <Tab menu={{
              pointing: true,
              secondary: true,
              style: {
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                fontSize: 'large',
                width: '100%'
              }
            }}
            panes={panes}
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minHeight: '50%',
              width:'100%',
              overflow: 'hidden',
              flex: '1'
            }}
            />   
      </Segment>
    );
  }
}

export default AnnotatorSidebar;
