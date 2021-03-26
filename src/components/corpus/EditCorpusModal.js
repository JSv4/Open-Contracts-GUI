import React, { useState } from 'react';
import { 
    Button,
    Modal, 
    Header,
    Icon,
    Grid,
} from 'semantic-ui-react';
import Form from "@rjsf/semantic-ui";
import _ from 'lodash';
import { HorizontallyCenteredDiv } from '../shared/layouts/Wrappers';
import {editCorpusForm_Ui_Schema, editCorpusForm_Schema} from '../forms/FormSchemas';
import UserPermissionsWidget from '../users/UserPermissionsWidget';
import FilePreviewAndUpload from '../shared/controls/FilePreviewAndUpload';

export function EditCorpusModal({
    open,
    onSubmit,
    toggleModal,
    values
}) {

    const [corpus_obj, setCorpusObj] = useState(values ? values : {shared_with:[], is_public:false});

    let can_write = _.includes(corpus_obj?.my_permissions, `change_corpus`);
    let can_permission =  _.includes(corpus_obj?.my_permissions, `permission_corpus`);

    const handleModelChange = (updated_fields) => {
        console.log("HandleModelChange: ", updated_fields);
        setCorpusObj((corpus_obj) => ({...corpus_obj, ...updated_fields}));
    }

    const handleChange = ({formData}) => {
        console.log(`update`, formData);
        handleModelChange(formData);   
    }

    let uischema = {...editCorpusForm_Ui_Schema};
    if (!can_write) {
        uischema = {
            ...uischema,
            "ui:readonly": true
        }
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
                        Edit Corpus: {values.title}
                        <Header.Subheader>Update corpus information...</Header.Subheader>
                    </Header.Content>
                </Header>
                </div>
            </HorizontallyCenteredDiv>
            <Modal.Content>
                <Grid divided='vertically'>
                    <Grid.Row>
                        <Grid.Column width={12}>
                            <Form 
                                schema={editCorpusForm_Schema}
                                uiSchema={uischema}
                                onChange={handleChange}
                                formData={corpus_obj}
                            >
                                <></>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={4}>
                            <FilePreviewAndUpload
                                is_image={true}
                                accepted_type=".png,.jpg,.gif"
                                disabled={!can_write}
                                file={values.icon}
                                onChange={(data) => handleModelChange({icon: data})}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    { 
                        can_permission ? <Grid.Row columns={1}>
                                            <Grid.Column>
                                                <UserPermissionsWidget
                                                    onChangePermissions={(data) => handleModelChange(data)}
                                                    model_object={corpus_obj}
                                                    model_name='corpus' 
                                                />
                                            </Grid.Column>
                                        </Grid.Row> : <></>
                    }
                </Grid>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='grey' onClick={() => toggleModal()}>
                    <Icon name='remove' /> Close
                </Button> 
                { 
                    can_write & !_.isEqual(values, corpus_obj) ?
                    <Button color='green' inverted onClick={() => onSubmit(corpus_obj)}>
                        <Icon name='checkmark' /> Update
                    </Button> : 
                    <></>
                }
            </Modal.Actions>
        </Modal>
    );
}
