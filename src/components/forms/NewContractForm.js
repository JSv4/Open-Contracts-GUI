import React from 'react';
import {
    newDocForm_Schema,
    newDocForm_Ui_Schema,
} from '../forms/FormSchemas';
import Form from "@rjsf/semantic-ui";

export const NewContractForm = ({meta_data, handleChange}) => {
    return(
        <Form 
            schema={newDocForm_Schema}
            uiSchema={newDocForm_Ui_Schema}
            onChange={handleChange}
            formData={meta_data}
        />
    );
}