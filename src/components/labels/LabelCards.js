import React, { useState } from "react";

import LabelItem from './LabelItem';
import PlaceholderItem from '../shared/placeholders/PlaceholderItem';
import GithubCorner from 'react-github-corner';

import _ from 'lodash';
import { Card, Segment, Dimmer, Loader } from 'semantic-ui-react';

const LabelCards = (props) => {

  const { 
      items, 
      selected_items,
      opened_item,
      loading,
      onOpen,
      onSelect,
      onDelete 
  } = props;

  const [contextMenuOpen, setContextMenuOpen] = useState(-1);

  let cards = <PlaceholderItem description="No Public Labels..."/>;

  if (items && items.length > 0) 
  {
    cards = items.map(item => <LabelItem 
                                key={item.id}
                                id={item.id}
                                is_public={item.is_public}
                                item={item}
                                selected={_.includes(selected_items, item.id)}
                                opened={opened_item===item.id}
                                onOpen={onOpen}
                                onSelect={onSelect}
                                onDelete={onDelete}
                                contextMenuOpen={contextMenuOpen}
                                setContextMenuOpen={setContextMenuOpen}/>)

  } 
  
  return (
    <Segment style={{width: '100%', padding:'1rem', margin:'1rem', minHeight:'70vh'}}>
      <GithubCorner 
        href="https://github.com/JSv4/Open-Contracts-GUI" 
        direction='right'
      />
      <Dimmer active={loading}>
        <Loader content='Loading Labelsets...' />
      </Dimmer>
      <Card.Group
        itemsPerRow={4}
        style={{width:'100%', padding:'1rem'}}
      >
        {cards}
      </Card.Group>
    </Segment>
  );
}

export default LabelCards;
