

import React, { useState, useRef } from "react";
import { Segment, Image, Label } from 'semantic-ui-react';

const FilePreviewAndUpload = (props) => {

    const [new_file, setNewFile] = useState(null);
    const fileRef = useRef(null);

    const { 
        is_image,
        accepted_types,
        style, 
        file,
        readonly,
        onChange
    } = props;

    
   
    // If user has loaded a new file... then display that, otherwise try to load image image property. 
    // If the image property isn't set and nothing has been selected by user, use the defauly image

    return (
        <input 
          ref={fileRef}
          readOnly={readonly}
          id='uploadFile'
          accept={accepted_types}
          hidden
          type="file"
          onChange={onFileChange}
        />
      );    
}

export default FilePreviewAndUpload;
