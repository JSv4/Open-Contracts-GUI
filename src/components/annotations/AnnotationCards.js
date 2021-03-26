import React, { useState } from "react";
import PlaceholderItem from '../shared/placeholders/PlaceholderItem';

import { Card, Segment, Dimmer, Loader, Icon, Label, Dropdown, Header, Form } from 'semantic-ui-react';

import _ from 'lodash';

const AnnotationCards = (props) => {

  const { 
        items, 
        loading,
        labels,
        show_annotations_for_label_id,
        search_term,
        onLabelChange,
        onSearchChange,
        selected_annotation,
        onSelectAnnotation,
        setContractToViewAnnotations,
        handleOpenContractClick
  } = props;

  const [search_value, setSearchValue] = useState(search_term); 

  let label_options=[];
  if (labels) {
    label_options = labels.map((label) => ({
      key: label.id,
      text: label.label,
      value: label.id,
      content: (
          <Header icon={label.icon} content={label.label} subheader={label.description} />
      ),
    }));
  }    

  let cards = <PlaceholderItem description="No Matching Annotations..."/>;
  if (items && items.length>0) 
  {
    cards = items.map(item => {
        return  <Card 
                    kwy={item.id}
                    style={{backgroundColor: item.id === selected_annotation ? '#e2ffdb' : ''}} 
                    onClick={() => {
                        console.log("Open contract:", item.document.id);
                        console.log("Annotation", item.id);
                        onSelectAnnotation(item.id).then(() => {
                            setContractToViewAnnotations(item.document);
                            handleOpenContractClick(item.document.id);
                            
                        });
                    }}
                >
                    <Card.Content style={{pading:'0px'}}>
                        <Label style={{color: item.label.color}}>
                            <Icon name='tags'/>{item.label.label}
                        </Label>
                    </Card.Content>
                    <Card.Content description={item.text} />
                    <Card.Content extra>
                        {/* <Label>
                            <Icon name='hashtag'/>Page {item.page}
                        </Label> */}
                        <Label>
                            <Icon name='file'/>{item.document.title}
                        </Label>
                    </Card.Content>
                </Card>;
     });    
}

  return (
    <div>
        <Segment>
            <div style={{
                height: '100%',
                display:'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                <div style={{width:'25vw'}}>
                    <Form onSubmit={() => onSearchChange(search_value)}>
                        <Form.Input
                            icon='search'
                            placeholder="Search for labelled text..."
                            onChange={(data)=> setSearchValue(data.target.value)}
                            value={search_value}
                        />
                    </Form>
                </div>
                <div style={{width:'25vw'}}> 
                    <Dropdown
                        fluid
                        selection
                        clearable
                        search
                        options={label_options}
                        onChange={(e, { value }) => {
                            onLabelChange(value);
                        }}
                        placeholder='Only show text for label...'
                        value={show_annotations_for_label_id}
                    />
                </div>
            </div>
        </Segment> 
        <Segment attached='top' raised style={{padding:'1rem', minHeight:'70vh'}}>
            <Dimmer active={loading}>
                    <Loader content='Loading Annotations...' />
                </Dimmer>
                <Card.Group itemsPerRow={4} style={{width:'100%', padding:'1rem'}}>
                    {cards}
                </Card.Group>
        </Segment>
    </div>
  );
}

export default AnnotationCards;
