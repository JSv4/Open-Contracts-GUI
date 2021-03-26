import React, { useState } from 'react';
import { 
    Button,
    Modal, 
    Header,
    Icon,
} from 'semantic-ui-react';
import Form from "@rjsf/semantic-ui";
import _ from 'lodash';
import { HorizontallyCenteredDiv } from '../shared/layouts/Wrappers';

export function FormModal({
    form_schema,
    form_ui_schema,
    values,
    open,
    onSubmit,
    toggleModal,
    headline,
    subheader,
    icon
}) {

    const [modal_values, setModalValues] = useState(values);

    const handleChange = ({formData}) => {
        console.log(`update`, formData);
        setModalValues(formData);
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
                    <Icon name={icon}/>
                    <Header.Content>
                        {headline}
                        <Header.Subheader>{subheader}</Header.Subheader>
                    </Header.Content>
                </Header>
                </div>
            </HorizontallyCenteredDiv>
            <Modal.Content>
                <Form 
                    schema={form_schema}
                    uiSchema={form_ui_schema}
                    onChange={handleChange}
                    formData={modal_values}
                >
                    <></>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='grey' onClick={() => toggleModal()}>
                    <Icon name='remove' /> Close
                </Button> 
                { 
                    !_.isEqual(values, modal_values) ?
                    <Button color='green' inverted onClick={() => onSubmit(modal_values)}>
                        <Icon name='checkmark' /> Save
                    </Button> : 
                    <></>
                }
            </Modal.Actions>
        </Modal>
    );
}
