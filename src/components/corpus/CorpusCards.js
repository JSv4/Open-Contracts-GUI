import React, { useState } from "react";

import CorpusItem from './CorpusItem';
import PlaceholderItem from '../shared/placeholders/PlaceholderItem';
import GithubCorner from 'react-github-corner';

import { Card, Segment, Dimmer, Loader } from 'semantic-ui-react';

const CorpusCards = (props) => {

  const { 
      items, 
      selected_item,
      on_select,
      loading,
      onDelete,
      onEdit,
      onView,
      onExport
  } = props;

  const [contextMenuOpen, setContextMenuOpen] = useState(-1);

  let cards = <PlaceholderItem description="No Public Corpuses..."/>;

  if (items && items.length > 0) 
  {
    cards = items.map(item => <CorpusItem 
                                key={item.id}
                                contextMenuOpen={contextMenuOpen}
                                setContextMenuOpen={setContextMenuOpen}
                                selected={selected_item===item.id}
                                key={item.id}
                                item={item}
                                on_select={() => on_select(item.id)}
                                onDelete={() => onDelete(item.id)}
                                onEdit={() => onEdit(item.id)}
                                onView={() => onView(item.id)}
                                onExport={() => onExport(item.id)}/>);
  } 
  
  return (
    <Segment style={{width: '100%', padding:'1rem', margin:'1rem', minHeight:'70vh'}}>
      <GithubCorner 
        href="https://github.com/JSv4/Open-Contracts-GUI" 
        direction='right'
      />
       <Dimmer active={loading}>
        <Loader content='Loading Corpuses...' />
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

export default CorpusCards;
