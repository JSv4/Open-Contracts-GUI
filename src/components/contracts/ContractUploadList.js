import React, { useCallback, useState } from 'react';
import { 
    Icon,
    Button,
    List,
    Segment, 
    Header
 } from 'semantic-ui-react';
import { useDropzone } from 'react-dropzone';
import {NOT_STARTED} from './ContractUploadModal';
import ContractListItem from './ContractListItem';

export function ContractUploadList(props) {

    const { documents, onSelect, onRemove, onAddFile, selected_file_num } = props;

    const onDrop = useCallback((acceptedFiles) => {
        
        console.log("OnDrop: ", acceptedFiles);

        Array.from(acceptedFiles).forEach((file) => {
            onAddFile({file, meta_json: {title: file.name, description: `Content summary for ${file.name}`, uploaded: NOT_STARTED}});
            // const reader = new FileReader()
            // reader.onabort = () => console.log('file reading was aborted')
            // reader.onerror = () => console.log('file reading has failed')
            // reader.onload = () => {
            // }
            // reader.readAsArrayBuffer(file)
        })
        
    }, [props]);
 
    const {getRootProps, getInputProps} = useDropzone({
        disabled: documents && Object.keys(documents).length > 0,
        onDrop
    });
        
    const fileInputRef = React.createRef();

    const grid = documents && Object.keys(documents).length > 0 ? Object.keys(documents).map((id) => {
        
        let document = documents[id];
        
        return <ContractListItem
            key={document?.file?.name ? document.file.name : id}
            onRemove={() => onRemove(id)}
            onSelect={() => onSelect(id)}
            selected={id===selected_file_num}
            document={document.file}
            status={document.uploaded}
        />
    }) : [<></>];

    function filesChanged (e) {
        onDrop(e.target.files);
    };

    return (  
        <div style={{...props.style, height:'100%'}}>
            <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                onChange={filesChanged}
            />
            <div {...getRootProps()} style={{
                                                height:'40vh',
                                                width: '100%', 
                                                padding: '1rem'}}>
                {documents && Object.keys(documents).length > 0 ? 
                    <Segment style={{height:'100%', width:'100%', overflowY:'scroll'}}>
                        <List celled>{grid}</List>
                    </Segment> : (
                    <Segment placeholder style={{height:'100%', width:'100%', overflowY:'scroll'}}>
                        <Header icon>
                        <Icon name='pdf file outline' />
                            Drag Documents Here or Click "Add Document(s)" to Upload
                            <br/><em>(Only *.pdf files supported for now)</em>
                        </Header>
                        <Button 
                            primary
                            onClick={() => fileInputRef.current.click()}
                        >
                            Add Document(s)
                        </Button>
                    </Segment>
                )}
                <input {...getInputProps()} />
            </div>
          </div>
    );
}  