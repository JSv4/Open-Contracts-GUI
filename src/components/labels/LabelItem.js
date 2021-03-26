

import React from "react";
import _ from 'lodash';
import { 
    Card,
    Popup,
    Image,
    Icon,
    Statistic, 
    Menu
} from 'semantic-ui-react';

import default_icon from '../../assets/images/defaults/default_tag.png';
import { SharedWithWidget } from "../shared/controls/SharedWithWidget";

const LabelItem = (props) => {

    const { 
        item,
        selected,
        opened,
        onOpen,
        onSelect,
        onDelete,
        contextMenuOpen,
        setContextMenuOpen
    } = props;

    const {
        id,
        is_public,
        title, 
        description,
        creator,
        icon,
        shared_with,
        my_permissions,
        label_count
    } = item;

    function createContextFromEvent(e) {
        const left = e.clientX
        const top = e.clientY
        const right = left + 1
        const bottom = top + 1
        
        return {
            getBoundingClientRect: () => ({
            left,
            top,
            right,
            bottom,
            height: 0,
            width: 0,
            }),
        }
    }

    const cardClickHandler = (event, value) => {
        
        console.log("Handle car click: ", event);

        event.stopPropagation();
        if (event.shiftKey) {
            console.log("Shift click...");
            if(onSelect && _.isFunction(onSelect)) {
                onSelect(id);
            }
        } else {
            console.log("Regular click");
            if(onOpen && _.isFunction(onOpen)) 
            {
                onOpen(id);
            }
        }
    }

    const contextRef = React.useRef()

    let can_write = _.includes(my_permissions, `change_labelset`);
    let can_delete = _.includes(my_permissions, 'delete_labelset');

    let context_menus = [{ key: 'view', content: 'View Details', icon: 'eye', onClick: () => onOpen(id) }];
    if (can_delete) context_menus.push({ key: 'copy', content: 'Delete Item', icon: 'trash', onClick: () => onDelete([id]) });
   
    return (
        <>
            <Card   
                key={id}
                style={opened ? {backgroundColor: '#e2ffdb'} : {}}
                onClick={cardClickHandler}
                onContextMenu={(e) => {
                    e.preventDefault()
                    contextRef.current = createContextFromEvent(e)
                    if (contextMenuOpen===id) {
                        setContextMenuOpen(-1);
                    }
                    else {
                        setContextMenuOpen(id);
                    }
                  }}
                onMouseEnter={() => {
                    if (contextMenuOpen!==id) {
                        setContextMenuOpen(-1);
                    }
                }} 
            >
                <Card.Content>
                    <Image
                        floated='right'
                        size='mini'
                        src={icon ? icon : default_icon}
                    />
                    <Card.Header>
                        <Popup content={`Full Title: ${title}`} 
                                trigger={
                                    <span>
                                        <Icon circular inverted color='teal' name='file text' />
                                        {title.substring(0,48)}
                                    </span>
                        } />    
                        { selected ? <div style={{float: 'right'}}>
                            <Icon name='check circle' color='green'/>
                        </div> : <></> }
                    </Card.Header>
                    <Card.Meta>{`Created by: ${creator?.email}`}</Card.Meta>
                    <Card.Description>
                        {description}
                    </Card.Description>
                    {!can_write ? <div style={{position:'absolute', bottom:'5rem', right:'1rem'}}>
                        <Popup trigger={<Icon name='lock' size='large' color='red'/>}>
                            READ ONLY ACCESS
                        </Popup>
                    </div> : <></>}
                </Card.Content>
                <Card.Content extra>
                    <Statistic.Group size='mini' widths='3'>
                        <SharedWithWidget is_public={is_public} shared_with={shared_with}/>
                        <Statistic>
                            <Statistic.Value>{label_count}</Statistic.Value>
                            <Statistic.Label>Labels</Statistic.Label>
                        </Statistic> 
                    </Statistic.Group>
                </Card.Content>
            </Card>
            <Popup
                basic
                context={contextRef}
                onClose={() => setContextMenuOpen(-1)}
                open={contextMenuOpen===id}
                hideOnScroll
            >
                <Menu
                    items={context_menus}
                    onItemClick={() => setContextMenuOpen(-1)}
                    secondary
                    vertical
                />
            </Popup>
        </>
      );    
}

export default LabelItem;
