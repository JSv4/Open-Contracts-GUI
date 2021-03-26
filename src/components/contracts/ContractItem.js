import React from "react";
import { 
    Statistic, 
    Icon,
    Card,
    Popup,
    Menu
} from 'semantic-ui-react';
import _ from 'lodash';

import { SharedWithWidget } from '../shared/controls/SharedWithWidget';

const ContractItem = (props) => {

    const contextRef = React.useRef();

    const { 
        item,
        selected,
        opened,
        delete_caption,
        download_caption,
        edit_caption,
        add_caption,
        contextMenuOpen,
        setContextMenuOpen,
        onEdit,
        onView,
        onSelect,
        onOpen,
        onDelete,
        onDownload,
        onAdd,
    } = props;

    const {
        id,
        type,
        title,
        description,
        pdf_file,
        is_public,
        shared_with,
        my_permissions
    } = item;

    const createContextFromEvent = (e) => {
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
        event.stopPropagation();
        if (event.shiftKey) {
            if(onSelect && _.isFunction(onSelect)) {
                onSelect(id);
            }
        } else {
            if(onOpen && _.isFunction(onOpen)) 
            {
                onOpen(id);
            }
        }
    }
  
    let can_write = _.includes(my_permissions, `change_document`);
    let can_delete = _.includes(my_permissions, 'delete_document');

    let context_menus = [{ key: 'view', content: 'View Details', icon: 'eye', onClick: () => onView() }];
    if (pdf_file) context_menus.push({ key: 'download', content: download_caption ? download_caption : 'Download PDF', icon: 'download', onClick: () => onDownload(pdf_file) });
    if (onAdd) context_menus.push({ key: 'add', content: add_caption ? add_caption : 'Add to Corpus', icon: 'plus circle', onClick: () => onAdd() });
    if (onEdit && can_write) context_menus.push({ key: 'code', content: edit_caption ? edit_caption : 'Edit Details', icon: 'edit outline', onClick: () => onEdit() });
    if (onDelete && can_delete) context_menus.push({ key: 'copy', content: delete_caption ? delete_caption :'Delete Item', icon: 'trash', onClick: () => onDelete(id) });    

    return (
        <>
            <Card 
                className='noselect'
                key={id}
                style={opened ? {backgroundColor: '#e2ffdb'} : {}} 
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
                onClick={cardClickHandler}>
                <Card.Content style={{wordWrap:'break-word'}}>
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
                    <Card.Meta>{`Document Type: *.pdf`}</Card.Meta>
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
                            <></>
                        </Statistic>
                            <SharedWithWidget is_public={is_public} shared_with={shared_with}/>
                        <Statistic>
                            <></>
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

export default ContractItem;
