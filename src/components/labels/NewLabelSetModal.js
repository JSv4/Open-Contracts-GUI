import React, { useState } from 'react';
import { 
    Button,
    Modal, 
    Header,
    Icon,
    Checkbox
} from 'semantic-ui-react';
import Form from "@rjsf/semantic-ui";
import _ from 'lodash';
import { HorizontallyCenteredDiv } from '../shared/layouts/Wrappers';
import { UserMultiSelect } from '../users/UserMultiSelect';
import { newLabelSetForm_Ui_Schema, newLabelSetForm_Schema} from '../forms/FormSchemas';

export function NewLabelSetModal({
    open,
    onSubmit,
    toggleModal,
    values
}) {

    const [is_public, setPublic] = useState(false);
    const [modal_values, setModalValues] = useState(values);
    const [shared_with, setSharedWithUsers] = useState([]);

    const handleChange = ({formData}) => {
        console.log(`update`, formData);
        setModalValues(formData);
    }

    const createSubmissionData = () => {
        let data = {
            ...modal_values,
            is_public,
            shared_with: shared_with.map(id => ({id}))
        };
        console.log("Submission data is: ", data);
        return data;
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
                        Create a New Label Set
                        <Header.Subheader>Please provide details about this label set...</Header.Subheader>
                    </Header.Content>
                </Header>
                </div>
            </HorizontallyCenteredDiv>
            <Modal.Content>
                <Form 
                    schema={newLabelSetForm_Schema}
                    uiSchema={newLabelSetForm_Ui_Schema}
                    onChange={handleChange}
                    formData={modal_values}
                >
                   <></>
                </Form>
                <Checkbox
                    label='Make Public (Everyone can see this!)'
                    onChange={() => setPublic(!is_public)}
                    checked={is_public}
                />
                {
                    !is_public ?  <UserMultiSelect 
                                        onChangeUsers={(data) => {
                                            console.log("Multi select data", data);
                                            setSharedWithUsers(data);
                                        }}
                                        selected_user_ids={shared_with} 
                                    /> : <></>
                }
               
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='grey' onClick={() => toggleModal()}>
                    <Icon name='remove' /> Close
                </Button> 
                { 
                    !_.isEqual(values, modal_values) ?
                    <Button color='green' inverted onClick={() => onSubmit(createSubmissionData())}>
                        <Icon name='checkmark' /> Save
                    </Button> : 
                    <></>
                }
            </Modal.Actions>
        </Modal>
    );
}
