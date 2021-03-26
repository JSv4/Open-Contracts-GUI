import React, { useState } from 'react';
import { 
    Header,
    Icon,
    Grid,
    Segment,
    Label
} from 'semantic-ui-react';
import Form from "@rjsf/semantic-ui";
import _ from 'lodash';
import { HorizontallyCenteredDiv, VerticallyCenteredDiv } from '../layouts/Wrappers';
import UserPermissionsWidget from '../../users/UserPermissionsWidget';
import FilePreviewAndUpload from './FilePreviewAndUpload';

export function CRUDWidget({
    mode,
    instance,
    model_name,
    ui_schema, 
    data_schema,
    show_header,
    handleInstanceChange,
    children,
    has_file, 
    file_field,
    file_label,
    file_is_image,
    accepted_file_types
}) {

    let can_write = mode!=="VIEW" && ((mode==="CREATE") || _.includes(instance?.my_permissions, `change_${model_name}`));
    let can_permission = mode!=="VIEW" && ((mode==="CREATE") || _.includes(instance?.my_permissions, `permission_${model_name}`));
    let can_publish = mode!=="VIEW" && ((mode==="CREATE") || _.includes(instance?.my_permissions, `publish_${model_name}`));

    const cleanFormData = (instance, data_schema) => {
        let cleaned_instance = {};
        let form_fields = Object.getOwnPropertyNames(data_schema.properties)
        console.log("Form fields: ", form_fields);
        for (var i = 0; i < form_fields.length; i++) {
              try{
                  cleaned_instance[form_fields[i]] = instance[form_fields[i]];
              }
              catch {}
        } 
        console.log("Final instance: ", cleaned_instance);
        return cleaned_instance;
    }

    const handleModelChange = (updated_fields) => {
        console.log("HandleModelChange: ", updated_fields);
        handleInstanceChange(updated_fields);
    }

    const handleChange = ({formData}) => {
        console.log(`update`, formData);
        handleInstanceChange(formData);   
    }

    let ui_schema_as_applied = {...ui_schema};
    if (!can_write) {
        ui_schema_as_applied["ui:readonly"] = true;
    }

    let descriptive_name = model_name.charAt(0).toUpperCase() + model_name.slice(1);
    let child_components = React.Children.toArray(children);
    let permissioned_components = child_components ? child_components.map((child) => React.cloneElement(child, { read_only: !can_write })) : []; //Add listeners to the child classes

    return (
        <div style={{marginBottom: '1rem'}}>
            {show_header ? 
                <HorizontallyCenteredDiv>
                    <div style={{marginTop: '1rem', textAlign: 'left'}}>
                        <Header as='h2'>
                            <Icon name='box'/>
                            <Header.Content>
                                {mode==='EDIT' ? `Edit ${descriptive_name}: ${instance.title}` : mode==='VIEW' ? `View ${descriptive_name}` : `Create ${descriptive_name}`}
                                <Header.Subheader>{`Values for: ${descriptive_name}`}</Header.Subheader>
                            </Header.Content>
                        </Header>
                    </div>
                </HorizontallyCenteredDiv> : <></>
            }
            <HorizontallyCenteredDiv>
                <VerticallyCenteredDiv>
                    <Segment raised style={{width:'100%'}}>
                        <Grid celled divided='vertically' style={{width:'100%'}}>
                            <Grid.Row>
                                <Grid.Column width={has_file ? 12 : 16}>
                                    <Form 
                                        schema={data_schema}
                                        uiSchema={ui_schema_as_applied}
                                        onChange={handleChange}
                                        formData={cleanFormData(instance, data_schema)}
                                    >
                                        <></>
                                    </Form>
                                </Grid.Column>
                                { has_file ? 
                                    <Grid.Column width={4}>
                                        <Label attached='top right'>{file_label}</Label>
                                        <FilePreviewAndUpload
                                            is_image={file_is_image}
                                            accepted_type={accepted_file_types}
                                            disabled={!can_write}
                                            file={instance.icon}
                                            onChange={(data) => handleModelChange({[file_field]: data})}
                                        />
                                    </Grid.Column> : <></>
                                }
                            
                            </Grid.Row>
                        </Grid>
                        <HorizontallyCenteredDiv style={{marginTop:'1rem'}}>
                            {permissioned_components}
                        </HorizontallyCenteredDiv>
                    </Segment>
                </VerticallyCenteredDiv>
            </HorizontallyCenteredDiv>
            { 
                can_permission ? 
                    <HorizontallyCenteredDiv style={{marginTop:'1rem'}}>
                        <UserPermissionsWidget
                            can_publish={can_publish}
                            onChangePermissions={(data) => handleModelChange(data)}
                            model_object={instance}
                            model_name={model_name}
                        />
                    </HorizontallyCenteredDiv> :
                    <></>
            }
        </div>         
    );
}
