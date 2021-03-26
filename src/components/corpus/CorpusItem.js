import React from "react";
import { 
    Icon,
    Card,
    Popup,
    Image,
    Statistic,
    Menu,
} from 'semantic-ui-react';
import {LabelSetStatistic} from '../shared/controls/LabelSetStatisticWidget';

import _ from 'lodash';
import { SharedWithWidget } from "../shared/controls/SharedWithWidget";

import default_corpus_icon from '../../assets/images/defaults/default_corpus.png';

const CorpusItem = (props) => {

    const { 
        item,
        selected,
        on_select,
        onDelete,
        onEdit,
        onView,
        onExport,
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
        label_set,
        documents, 
        shared_with,
        my_permissions
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

    const contextRef = React.useRef()

    let can_write = _.includes(my_permissions, `change_corpus`);
    let can_delete = _.includes(my_permissions, 'delete_corpus');

    let context_menus = [
        { key: 'view', content: 'View Details', icon: 'eye', onClick: () => onView() },
        { key: 'export', content: "Export Corpus", icon:'cloud download', onClick: () => onExport() }
    ];
    if (can_write) context_menus.push({ key: 'code', content: 'Edit Details', icon: 'edit outline', onClick: () => onEdit() });
    if (can_delete) context_menus.push({ key: 'copy', content: 'Delete Item', icon: 'trash', onClick: () => onDelete() });

    return (
        <>
            <Card 
                key={id}
                style={selected ? {backgroundColor: '#e2ffdb'} : {}}
                onClick={() => on_select()}
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
                <Image src={icon ? icon : default_corpus_icon} wrapped ui={false} />
                <Card.Content style={{wordWrap:'break-word'}}>
                    <Card.Header>{title}</Card.Header>
                    <Card.Meta>{`Created by: ${creator?.email}`}</Card.Meta>
                    <Card.Description>
                        <span><b>Description:</b> {description}</span>
                    </Card.Description>
                    {!can_write ? <div style={{position:'absolute', bottom:'5rem', right:'1rem'}}>
                        <Popup trigger={<Icon name='lock' size='large' color='red'/>}>
                            READ ONLY ACCESS
                        </Popup>
                    </div> : <></>}
                </Card.Content>
                <Card.Content extra>
                    <Statistic.Group size='mini' widths='3'>
                        <Statistic>
                            <Statistic.Value>{documents.length}</Statistic.Value>
                            <Statistic.Label>Docs</Statistic.Label>
                        </Statistic>
                        <SharedWithWidget is_public={is_public} shared_with={shared_with}/>
                        <LabelSetStatistic label_set={label_set}/>
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

export default CorpusItem;
