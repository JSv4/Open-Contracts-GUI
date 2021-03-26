import React, { useState } from 'react';
import { 
    Button,
    Modal, 
    Icon,
} from 'semantic-ui-react';
import _ from 'lodash';
import { CRUDWidget } from '../controls/CRUDWidget';

export function ObjectCRUDModal({
    open,
    mode,
    old_instance,
    model_name,
    ui_schema, 
    data_schema,
    onSubmit,
    toggleModal,
    children,
    has_file, 
    file_field,
    file_label,
    file_is_image,
    accepted_file_types
}) {

    const [instance_obj, setInstanceObj] = useState(old_instance ? old_instance : {shared_with:[], is_public:false});
    const [updated_fields_obj, setUpdatedFields] = useState({id: old_instance?.id ? old_instance.id : -1});

    console.log("Children", children);

    let can_write = mode!=="VIEW" && ((mode==="CREATE") || _.includes(instance_obj?.my_permissions, `change_${model_name}`));

    const handleModelChange = (updated_fields) => {
        console.log("HandleModelChange: ", updated_fields);
        setInstanceObj((instance_obj) => ({...instance_obj, ...updated_fields}));
        setUpdatedFields((updated_fields_obj) => ({...updated_fields_obj, ...updated_fields}));
    }

    let ui_schema_as_applied = {...ui_schema};
    if (!can_write) {
        ui_schema_as_applied["ui:readonly"] = true;
    }

    let child_components = React.Children.toArray(children);
    let listening_children = child_components ? child_components.map((child) => React.cloneElement(child, { onChange: handleModelChange })) : []; //Add listeners to the child classes

    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => toggleModal()}
        >   
            <Modal.Content>
                <CRUDWidget
                    mode={mode}
                    instance={instance_obj}
                    model_name={model_name}
                    ui_schema={ui_schema}
                    data_schema={data_schema}
                    show_header={true}      
                    handleInstanceChange={handleModelChange}
                    has_file={has_file}
                    file_field={file_field}
                    file_label={file_label}
                    file_is_image={file_is_image}
                    accepted_file_types={accepted_file_types}
                >
                    {listening_children}
                </CRUDWidget>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='grey' onClick={() => toggleModal()}>
                    <Icon name='remove' /> Close
                </Button> 
                { 
                    can_write & !_.isEqual(old_instance, instance_obj) ?
                    <Button color='green' inverted onClick={() => onSubmit(mode === 'EDIT' ? updated_fields_obj : instance_obj)}>
                        <Icon name='checkmark' /> {mode === 'EDIT' ? 'Update' : 'Create'}
                    </Button> : 
                    <></>
                }
            </Modal.Actions>
        </Modal>
    );
}
