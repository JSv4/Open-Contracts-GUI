import React, { useState } from "react";
import ContractItem from './ContractItem';
import PlaceholderItem from '../shared/placeholders/PlaceholderItem';
import GithubCorner from 'react-github-corner';

import { Card, Segment, Dimmer, Loader } from 'semantic-ui-react';

import _ from 'lodash';

const ContractCards = (props) => {

  const [contextMenuOpen, setContextMenuOpen] = useState(-1);

  const { 
      items, 
      selected_items,
      opened_item,
      onOpen,
      onSelect,
      onDelete,
      delete_caption,
      onDownload,
      download_caption,
      onEdit,
      edit_caption,
      onAdd,
      add_caption,
      loading,
      style
  } = props;

  let cards = <PlaceholderItem description="No Matching Contracts..."/>;
  if (items && items.length>0) 
  {
    cards = items.map(item => {
    return <ContractItem
                key={item.id}
                item={item}
                contextMenuOpen={contextMenuOpen}
                setContextMenuOpen={setContextMenuOpen}
                selected={_.includes(selected_items, item.id)}
                opened={opened_item===item.id}
                onOpen={onOpen}
                onSelect={onSelect}
                onDelete={onDelete}
                onDownload={onDownload}
                delete_caption={delete_caption}
                download_caption={download_caption}
                edit_caption={edit_caption}
                add_caption={add_caption}
                onEdit={onEdit ? () => onEdit(item.id) : null}
                onAdd={onAdd ? () => onAdd(item.id) : null}
                onView={onOpen ? () => onOpen(item.id) : null}
            />;
    });
  }

  return (
    <Segment raised style={ style? style : {margin:'1rem', width:'100%', padding:'1rem', minHeight:'70vh'}}>
      <GithubCorner 
        href="https://github.com/JSv4/Open-Contracts-GUI" 
        direction='right'
      />
      <Dimmer active={loading}>
        <Loader content='Loading Contracts...' />
      </Dimmer>
      <Card.Group itemsPerRow={4} style={{width:'100%', padding:'1rem'}}>
          {cards}
      </Card.Group>   
    </Segment>    
  );
}

export default ContractCards;
