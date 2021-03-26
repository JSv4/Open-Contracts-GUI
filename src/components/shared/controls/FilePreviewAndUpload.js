

import React, { useState, useRef } from "react";
import { Segment, Image, Label } from 'semantic-ui-react';

import default_image from '../../../assets/images/defaults/default_image.png';
import default_file from '../../../assets/images/defaults/default_file.png';

const FilePreviewAndUpload = (props) => {

    const [new_file, setNewFile] = useState(null);
    const fileRef = useRef(null);

    const { 
        is_image,
        accepted_types,
        style, 
        file,
        readonly,
        disabled,
        onChange
    } = props;

    const onFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
          let reader = new FileReader();
          reader.onload = (e) => {
            setNewFile(e.target.result);
            onChange(e.target.result);
          };
          reader.readAsDataURL(event.target.files[0]);
        }
      }

    const onFileClick = () => {
        if (!readonly) {
            fileRef.current.click();
        }
      };
   
    // If user has loaded a new file... then display that, otherwise try to load image image property. 
    // If the image property isn't set and nothing has been selected by user, use the defauly image

    return (
        <Segment tertiary disabled={readonly || disabled ? 'disabled' : undefined} raised style={{width: '100%', ...style}}>
            {!readonly && !disabled ? <Label corner='right' icon='edit outline' onClick={onFileClick}/> : <></>}
            {
              is_image ? 
                <Image 
                  style={{width:'100%'}} 
                  src={new_file ? new_file : file ? file : default_image}
                /> 
                :  
                <Image 
                  style={{width:'100%'}} 
                  src={default_file}
                />
                
            }
            <input 
              ref={fileRef}
              readOnly={readonly}
              id='selectImage'
              accept={accepted_types}
              hidden
              type="file"
              onChange={onFileChange}
            />
            {!is_image ? <Label attached='bottom'>{new_file ? new_file.filename : file}</Label> : <></>}
        </Segment>
      );    
}

export default FilePreviewAndUpload;
