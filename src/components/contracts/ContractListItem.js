import React, { Component } from 'react'
import { Icon, List, Dimmer, Loader, Message } from 'semantic-ui-react'

import { NOT_STARTED, UPLOADING, SUCCESS, FAILED} from './ContractUploadModal';

export default class ContractListItem extends Component {
    render() {  
        const {document, status, onRemove, selected, onSelect} = this.props;

        let icon_color='grey';
        if (status === SUCCESS) {
            icon_color='green'
        }
        else if (status === FAILED) {
            icon_color='red'
        }
        
        return (
            <List.Item style={selected ? {backgroundColor: '#e2ffdb'} : {}} onClick={onSelect}>
                <Dimmer active={status===UPLOADING ? 'active' : undefined} inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>
                { status === NOT_STARTED ? <div style={{float:'right', cursor: 'pointer'}}>
                    <Icon name='trash' color='red' onClick={onRemove}/>
                </div> : <></> }
                <List.Icon 
                    name='file alternate'
                    size='large'
                    color={icon_color}
                    verticalAlign='middle'
                />
                <List.Content>
                        <List.Header>
                            {status === FAILED ?
                              <Message negative>
                                <Message.Header>ERROR UPLOADING: {document?.name ? document.name : "No contracts"} </Message.Header>
                                </Message> :
                                <p>{document?.name ? document.name : "No contracts"}</p>
                            }
                            
                        </List.Header>
                </List.Content>
            </List.Item>
        );
    }
}  