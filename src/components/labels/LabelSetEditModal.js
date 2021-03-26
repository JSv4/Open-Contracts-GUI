import React from 'react';
import { 
    Button,
    Modal, 
    Header,
    Icon,
    Card,
    Segment, 
    Tab,
} from 'semantic-ui-react';
import _ from 'lodash';

import { DataLabel } from './DataLabels';
import { HorizontallyCenteredDiv } from '../shared/layouts/Wrappers';
import { CreateAndSearchBar } from '../shared/controls/CreateAndSearchBar';
import { CRUDWidget } from '../shared/controls/CRUDWidget';

import { newLabelSetForm_Ui_Schema, newLabelSetForm_Schema } from '../forms/FormSchemas';

import Fuse from 'fuse.js';

import 'semantic-ui-react-icon-picker/dist/index.css';

const empty_label = {
    label:'New Label',
    icon: 'tag',
    color: '#1c4966',
    description: 'Describe your label'
}

const fuse_options = {
    includeScore: false,
    findAllMatches: true,
    // Search in `label` and in `description` fields
    keys: ['label', 'description']
} 

export class LabelSetEditModal extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            new_data: { id: this.props.label_set?.id ? this.props.label_set.id : -1 },
            updated_obj: {...this.props.label_set},
            can_save: false,  
            active_index: 0
        };
    }

    onCRUDChange = (newValueJson) => {
        this.setState({
            new_data: {...this.state.new_data, ...newValueJson},
            updated_obj: {...this.state.updated_obj, ...newValueJson},
            can_save: true
        });
    }
        
    setSearchTerm = (search_term) => {
        this.setState({
            search_term,
        });
    }

    addTextLabel = () => {
        this.props.onLabelCreate(this.props.label_set.id, {...empty_label, type:'TEXT_LABEL'});
    }

    addRelationLabel = () => {
        this.props.onLabelCreate(this.props.label_set.id, {...empty_label, type:'RELATIONSHIP_LABEL'});
    }

    handleTabChange = (e, { activeIndex }) => this.setState({ active_index: activeIndex })

    handleSave = () => {
        //Shoot state out to parent for saving...
        this.props.onSave(this.state.new_data);

        //Reset modal component state
        this.setState({
            new_data: { id: this.props.label_set.id },
            updated_obj: {...this.props.label_set},
            can_save: false,  
            search_term: "",
            active_index: 0
        });

        // Close modal
        this.props.toggleModal()
    }

    handleClose = () => {
        this.props.handleClearSelectedLabels();
        this.props.toggleModal();
    }

    render() {
        
        let {
            open,
            toggleModal,
            labels,
            label_set,
            onDelete, 
            onLabelUpdate,
            selected_labels,
            toggleSelectLabel
        } = this.props;

        let {
            updated_obj, 
            can_save,
            search_term,
            active_index
        } = this.state;

        let {
            title,
        } = updated_obj;

        let { REACT_APP_ALLOW_RELATIONS } = process.env;

        // Get write permissions
        let can_edit_labelset = _.includes(label_set?.my_permissions, `change_labelset`);

        // Split out the labels by type
        let text_labels = _.filter(labels, {type: "TEXT_LABEL"});
        let relation_labels = _.filter(labels, {type: "RELATIONSHIP_LABEL"});

        //Filter the text label set:
        let text_label_fuse = new Fuse(text_labels, fuse_options);
        let text_label_results = [];
        if (search_term) {
            text_label_results = text_label_fuse.search(search_term).map(item => item.item);
        } 
        else {
            text_label_results = text_labels;
        }

        //Build text label components
        let text_data_labels = [];
        if (text_labels && text_labels.length > 0) {
            text_data_labels = text_label_results.map((label, index) => {
                return <DataLabel 
                            can_edit={can_edit_labelset}
                            key={label.id} 
                            index={index} 
                            label={label} 
                            selected={_.includes(selected_labels, label.id)}
                            onDelete={() => onDelete([label.id])}
                            onSelect={toggleSelectLabel}
                            onLabelUpdate={onLabelUpdate}/>
            });
        }

        // Filter relation labels
        let relation_label_fuse = new Fuse(relation_labels, fuse_options);
        let relation_label_results = [];
        if (search_term) {
            relation_label_results = relation_label_fuse.search(search_term).map(item => item.item);
        } 
        else {
            relation_label_results = relation_labels;
        }
      
        // Build DataLabel components
        let relation_data_labels = [];
        if (relation_labels && relation_labels.length > 0) {
            relation_data_labels = relation_label_results.map((label, index) => {
                return <DataLabel 
                            can_edit={can_edit_labelset}
                            key={label.id} 
                            index={index} 
                            label={label} 
                            selected={_.includes(selected_labels, label.id)}
                            onDelete={() => onDelete([label.id])}
                            onSelect={toggleSelectLabel}
                            onLabelUpdate={onLabelUpdate}/>
            });
        }

        let action_buttons = [];

        if((this.state.active_index === 1 || this.state.active_index === 2) && can_edit_labelset) {
            action_buttons.push({
                title: this.state.active_index===1 ? "Create Text Label" : this.state.active_index===2 ? "Create Relation Label" : "",
                icon: "plus",
                action_function: this.state.active_index===1 ? () => this.addTextLabel(empty_label) : this.state.active_index===2 ? () => this.addRelationLabel(empty_label) : {}
            });
        }

        if(selected_labels?.length > 0 && can_edit_labelset) {
            action_buttons.push({
                title: "Delete Selected Label(s)",
                icon: 'remove circle',
                action_function: () => onDelete(selected_labels)
            });
        }

        const panes = [
            {
                menuItem: 'Name & Description',
                render: () => (
                    <Tab.Pane key={1} style={{overflowY:'scroll', padding: '1em', width:'100%'}}>
                        <CRUDWidget
                            mode='EDIT'
                            instance={(({ title, description, icon, shared_with, is_public, my_permissions }) => ({ title, description, icon, shared_with, is_public, my_permissions })) (this.state.updated_obj) }
                            model_name='labelset'
                            ui_schema={newLabelSetForm_Ui_Schema}
                            data_schema={newLabelSetForm_Schema}
                            handleInstanceChange={this.onCRUDChange}
                            has_file={true}
                            file_field='icon'
                            file_label='Labelset Icon' 
                            file_is_image={true}
                            accepted_file_types=".png,.jpg,.gif"
                        />
                    </Tab.Pane>
                )
            },
            {
              menuItem: `Text Labels (${text_label_results?.length})`,
              render: () => 
              (<Tab.Pane key={1} style={{overflowY:'scroll', padding: '1em', width:'100%', flex: 1}}>
                    <Card.Group itemsPerRow={1}>
                        {text_data_labels}
                    </Card.Group>
              </Tab.Pane>)
            }];
        if (REACT_APP_ALLOW_RELATIONS===true) {
            panes.push({
                menuItem: `Relations Labels (${relation_label_results?.length})`,
                render: () => (
                  <Tab.Pane key={1} style={{overflowY:'scroll', padding: '1em', width:'100%', flex: 1}}>
                      <Card.Group itemsPerRow={1}>
                          {relation_data_labels}
                      </Card.Group>
                  </Tab.Pane>
                ),
              });
        }

        return (
            <>
                <Modal
                    closeIcon
                    open={open}
                    onClose={() => toggleModal()}
                    size='large'
                >   
                    <HorizontallyCenteredDiv>
                        <div style={{marginTop: '1rem', textAlign: 'left'}}>
                        <Header as='h2'>
                            <Icon name='tags'/>
                            <Header.Content>
                                Edit Label Set: {title}
                            </Header.Content>
                        </Header>
                        </div>
                    </HorizontallyCenteredDiv>
                    <HorizontallyCenteredDiv>
                        <CreateAndSearchBar
                            onSubmit={(value)=> this.setSearchTerm(value)} 
                            actions={action_buttons}
                            placeholder='Search for label set...'
                            value={search_term}
                        />
                    </HorizontallyCenteredDiv> 
                    <Modal.Content>
                        <Segment raised style={{
                            height:'50vh',
                            width:'100%',
                            padding:'0px',
                            display:'flex',
                            margin:'0px',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center'
                        }}>
                            <Tab menu={{
                                pointing: true,
                                secondary: true,
                                style: {
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    fontSize: 'large',
                                    width: '100%',
                                    margin: '0px'
                                }
                                }}
                                panes={panes}
                                activeIndex={active_index}
                                onTabChange={this.handleTabChange}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    minHeight: '50%',
                                    width:'100%',
                                    overflow: 'hidden',
                                    flex: '1'
                                }}
                            />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button basic color='grey' onClick={() => this.handleClose()}>
                            <Icon name='remove' /> Close
                        </Button> 
                        { 
                            can_save ?
                            <Button color='green' inverted onClick={() => this.handleSave()}>
                                <Icon name='checkmark' /> Save
                            </Button> : 
                            <></>
                        }
                    </Modal.Actions>
                </Modal>
            </>);
    }
}
