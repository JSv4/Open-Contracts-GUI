import React, { useState } from 'react';
import { 
    Button,
    Modal, 
    Header,
    Icon
} from 'semantic-ui-react';
import Form from "@rjsf/semantic-ui";
import _ from 'lodash';
import { HorizontallyCenteredDiv } from '../shared/layouts/Wrappers';
import {newCorpusForm_Ui_Schema, newCorpusForm_Schema} from '../forms/FormSchemas';
import UserPermissionsWidget from '../users/UserPermissionsWidget';

export function NewCorpusModal({
    open,
    onSubmit,
    toggleModal,
    values
}) {

    const [corpus_obj, setCorpusObj] = useState(values ? values : {shared_with:[], is_public:false});

    const handleModelChange = (updated_fields) => {
        setCorpusObj((corpus_obj) => ({...corpus_obj, ...updated_fields}));
    }

    const handleChange = ({formData}) => {
        console.log(`update`, formData);
        handleModelChange(formData);   
    }

    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => toggleModal()}
        >
             <HorizontallyCenteredDiv>
                <div style={{marginTop: '1rem', textAlign: 'left'}}>
                <Header as='h2'>
                    <Icon name='box'/>
                    <Header.Content>
                        Create a New Corpus
                        <Header.Subheader>Please provide required corpus information...</Header.Subheader>
                    </Header.Content>
                </Header>
                </div>
            </HorizontallyCenteredDiv>
            <Modal.Content>
                <Form 
                    schema={newCorpusForm_Schema}
                    uiSchema={newCorpusForm_Ui_Schema}
                    onChange={handleChange}
                    formData={corpus_obj}
                >
                   <></>
                </Form>
                <UserPermissionsWidget
                    onChangePermissions={(data) => handleModelChange(data)}
                    model_object={corpus_obj}
                    model_name='corpus' 
                /> : <></>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='grey' onClick={() => toggleModal()}>
                    <Icon name='remove' /> Close
                </Button> 
                { 
                    !_.isEqual(values, corpus_obj) ?
                    <Button color='green' inverted onClick={() => onSubmit(corpus_obj)}>
                        <Icon name='checkmark' /> Save
                    </Button> : 
                    <></>
                }
            </Modal.Actions>
        </Modal>
    );
}
