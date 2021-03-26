import React, { useState} from 'react';
import { 
    Button,
    Header,
    Grid,
    Icon,
    Card,
    Form, 
    TextArea, 
    Popup,
    Segment, 
    Label,
} from 'semantic-ui-react';
import _ from 'lodash';

import { VerticallyCenteredDiv } from '../shared/layouts/Wrappers';
import { IconPicker } from 'semantic-ui-react-icon-picker';
import ColorPickerSegment from '../shared/controls/ColorPickerSegment';

export function DataLabel({label, selected, onSelect, onDelete, onLabelUpdate, can_edit}) {
    
    const [edit_mode, setEditMode] = useState(false);
    const [revised_obj, setRevisedObj] = useState(label);

    const cardClickHandler = (event, value) => {
        event.stopPropagation();
        if (event.shiftKey) {
            if(onSelect && _.isFunction(onSelect)) {
                onSelect(label.id);
            }
        } 
    }

    const updateLocalObj = (updates) => {
        setRevisedObj((revised_obj) => ({...revised_obj, ...updates}));        
    }

    const handleChange = (e, {name, value}) => {
        updateLocalObj({[name]: value});
    }

    const handleSave = () => {
        onLabelUpdate(revised_obj);
        setEditMode(false);

    }

    return (
        <Card fluid key={label.id} onClick={cardClickHandler}>
             <div style={{position:'absolute', right:'1rem', top:'1rem', zIndex:1000}}>
                { can_edit ? edit_mode ? 
                    <Button icon='save' color='green' circular onClick={() => handleSave()}/> :
                    <Button icon='edit' circular onClick={() => setEditMode(true)}/> : <></> 
                }
                { can_edit ? <Button icon='trash' color='red' circular onClick={() => onDelete([label.id])}/> : <></> }
            </div>
            <Card.Content>
                { selected ? <Label icon='check circle' corner='right' color='green'/> : <></> }
                <Card.Description>
                    {
                        edit_mode && can_edit ? 
                        <Grid centered divided>
                            <Grid.Column textAlign='center' width={4}>
                                <Popup trigger={<VerticallyCenteredDiv>
                                                    <div style={{width:'100%', display: 'flex', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                                                        <Icon size='massive' name={revised_obj?.icon} style={{color: revised_obj?.color}}/>
                                                    </div>
                                                    <div style={{
                                                        width:'100%',
                                                        display: 'flex',
                                                        flexDirection:'row',
                                                        alignItems:'center',
                                                        justifyContent:'center',
                                                        marginTop:'1rem'
                                                    }}>
                                                        <Label style={{backgroundColor: revised_obj?.color, color: 'white'}}>
                                                            Highlight Color
                                                        </Label>
                                                    </div>                                                  
                                                </VerticallyCenteredDiv>} 
                                    flowing
                                    hoverable
                                    style={{width:'20vw'}}
                                >
                                    <Segment>
                                        <div>
                                            <strong>Highlight Color:</strong>
                                            <ColorPickerSegment color={revised_obj?.color} setColor={(color) => updateLocalObj({color: color.hex})}/>
                                        </div>
                                        <div style={{marginTop:'1rem'}}>
                                            <strong>Icon:</strong>
                                            <IconPicker value={revised_obj?.icon} onChange={(icon) => updateLocalObj({icon})} style={{width:'20vw'}}/>
                                        </div>
                                    </Segment>
                                </Popup>
                            </Grid.Column>
                            <Grid.Column textAlign='left' width={12}>
                                <Grid>
                                    <Grid.Row>
                                        <Grid.Column textAlign='left'>
                                            <Form>
                                                <Header as='h3'>Label:</Header>
                                                <Form.Group>
                                                    <Form.Input
                                                        placeholder='Label'
                                                        name='label'
                                                        value={revised_obj?.label}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Form> 
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Grid.Column textAlign='left'>
                                            <Form>
                                                <Header as='h3'>Description:</Header>
                                                <TextArea
                                                    rows={2}
                                                    label='Description:'
                                                    name='description'
                                                    placeholder='Describe what this label does' 
                                                    value={revised_obj?.description}
                                                    onChange={handleChange}
                                                />
                                            </Form>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Grid.Column>
                        </Grid> 
                        :
                        <Grid centered divided>
                            <Grid.Column textAlign='center' width={4}>
                                <VerticallyCenteredDiv>
                                    <div style={{width:'100%', display: 'flex', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                                        <Icon size='massive' name={label?.icon} style={{color: label?.color}}/>
                                    </div>
                                    <div style={{
                                        width:'100%',
                                        display: 'flex',
                                        flexDirection:'row',
                                        alignItems:'center',
                                        justifyContent:'center',
                                        marginTop:'1rem'
                                    }}>
                                        <Label style={{backgroundColor:label?.color, color: 'white'}}>
                                            Highlight Color
                                        </Label>
                                    </div>                                                  
                                </VerticallyCenteredDiv>
                            </Grid.Column>
                            <Grid.Column textAlign='left' width={12}>
                                <Grid>
                                    <Grid.Row>
                                        <Grid.Column textAlign='left'>
                                            <Header as='h3'>Label: </Header>{label?.label}
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Grid.Column textAlign='left'>
                                            <Header as='h3'>Description: </Header>
                                            <p>{label?.description}</p>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Grid.Column>
                        </Grid> 
                    }                
                </Card.Description>
            </Card.Content>
        </Card>);
}