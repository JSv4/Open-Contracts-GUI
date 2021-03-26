// @flow

import React, {useState} from "react";
import { 
    Modal,
    Icon,
    Label,
    Button,
    Divider,
    Segment,
    Header,
    Grid,
    Dropdown,
    Card
} from 'semantic-ui-react';
import {HorizontallyCenteredDiv} from '../shared/layouts/Wrappers';
import _ from 'lodash';


function HighlightCard({ key, highlight }) {
    return <Card fluid key={key}>
    <Card.Content header style={{color: highlight?.comment?.color ? highlight.comment.color : 'grey'}}>
        {highlight?.comment?.icon ? <Icon name={highlight.comment.icon} /> : <></>}
        <b>ORIGIN:</b> <strong>{highlight?.comment?.text ? highlight.comment.text : ""}</strong>
    </Card.Content>
    <Card.Content>
        {highlight?.content.text ? (
        <blockquote style={{ marginTop: "0.5rem" }}>
            {`${highlight.content.text.slice(0, 90).trim()}…`}
        </blockquote>
        ) : null}
        {highlight?.content.image ? (
        <div
            className="highlight__image"
            style={{ marginTop: "0.5rem" }}
        >
            <img src={highlight.content.image} alt={"Screenshot"} />
        </div>
        ) : null}
    </Card.Content>
    <Card.Content extra style={{textAlign: 'right'}}>
        Page <Icon name='hashtag' />{highlight?.position?.pageNumber}
    </Card.Content>
</Card>;
}

function PlaceholderCard({type, message}) {
    return <Segment placeholder>
    <Header icon>
        <Icon name={type}/>
        {message}
    </Header>
</Segment>
}

function NewRelationshipModal({ highlights, origin, target, visible, toggleModal, onCreate, relation_labels }) {
    
    const [label, setLabel] = useState(null);

    const handleDropdownChange = (e, { value }) => {
        console.log("Handle drop down change", value);
        setLabel(value);
    }

    if (!relation_labels || !Array.isArray(relation_labels) || relation_labels.length===0) {
        return (
            <Modal
                onClose={() => toggleModal()}
                open={visible}
                style={{width:'20vw', padding:'1em'}}
            >
                <Label corner='right' color='red' icon='cancel' onClick={() => toggleModal()}/>
                <HorizontallyCenteredDiv>
                <h1 style={{ margin: "1rem" }}>No Relations Defined in this Label Set</h1>
                </HorizontallyCenteredDiv>
                <HorizontallyCenteredDiv>
                    <PlaceholderCard 
                        type='arrows alternate horizontal'
                        message='No label relations are defined in the Label Set. If 
                                you have edit rights, try defining a new relationship 
                                label and try again.'
                    />
                </HorizontallyCenteredDiv>
            </Modal>);
    }

    let OriginElement = <PlaceholderCard type={"arrow"} message="Select a source annotation (CTRL + click on an annotation)..."/>;

    if (origin) {
        let origin_highlight = _.find(highlights, {id: origin});
        OriginElement = <HighlightCard key={1} highlight={origin_highlight}/>;
    }

    let TargetElement = <PlaceholderCard type={"target"} message="Select a target annotation (SHIFT + click on an annotation)..."/>;
    if (target) {
        let target_highlight = _.find(highlights, {id: target});
        TargetElement = <HighlightCard key={2} highlight={target_highlight}/>;
    }

    const choices = Array.isArray(relation_labels) && relation_labels.length > 0 ? relation_labels.map((choice) => {
        return {
            key: choice.id,
            text: choice.label,
            value: choice.id,
            color: choice.color
        };
    }) : [{
        key: 1,
        text: "No relation set loaded...",
        value: 1,
        icon: "cancel"
    }];
  
  return (
    <Modal
        onClose={() => toggleModal()}
        open={visible}
        style={{width:'20vw', padding:'1em'}}
    >
        <Label corner='right' color='red' icon='cancel' onClick={() => toggleModal()}/>
        <HorizontallyCenteredDiv>
          <h1 style={{ margin: "1rem" }}>Link Labels</h1>
        </HorizontallyCenteredDiv>
        <HorizontallyCenteredDiv>
          <p>
            <small>
              Create a relationship between selected origin and target annotations:
            </small>
          </p>
        </HorizontallyCenteredDiv>
        <Segment placeholder>
            <Grid columns={1} stackable>
                <Grid.Row verticalAlign='middle'>
                    <Grid.Column>
                        <HorizontallyCenteredDiv>
                            {OriginElement}
                        </HorizontallyCenteredDiv>
                    </Grid.Column>
                </Grid.Row>
                <Divider horizontal>
                    <Dropdown
                        placeholder='Relationship-->'
                        fluid
                        onChange={handleDropdownChange}
                        search
                        options={choices}
                        style={{ marginBottom:'1em' }}
                    />
                </Divider>
                <Grid.Row verticalAlign='middle'>
                    <Grid.Column>
                        <HorizontallyCenteredDiv>
                            {TargetElement}
                        </HorizontallyCenteredDiv>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
        <div style={{width: '100%'}}>
            <Button
                color='green'
                content='Create'
                icon='right arrow'
                labelPosition='right'
                floated='right'
                disabled={!origin || !target || !label}
                onClick={() => {
                    onCreate({
                        targetId: target, 
                        fromId: origin,
                        label
                    });
                    toggleModal();
                }}
            />
        </div>
    </Modal>
  );
}

export default NewRelationshipModal;
