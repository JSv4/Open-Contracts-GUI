import React, { useState } from 'react';
import { 
    Button,
    Modal, 
    Grid, 
    Divider, 
    Segment,
    Header,
    Icon,
    Message
} from 'semantic-ui-react';
import _ from 'lodash';

import { NewContractForm } from '../forms/NewContractForm';
import { ContractUploadList } from './ContractUploadList';
import { HorizontallyCenteredDiv, VerticallyCenteredDiv } from '../shared/layouts/Wrappers';

export const NOT_STARTED = 'NOT_STARTED';
export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';
export const UPLOADING = 'UPLOADING';

export function RightCol({files, selected_file_num, selected_doc, handleChange}) {
    if (files && Object.keys(files).length > 0 && selected_file_num > 0) {
        return  <Segment style={{height:'100%', width:'100%', padding:'2rem'}}>
                    <NewContractForm
                        meta_data={selected_doc?.meta_json}
                        handleChange={handleChange}
                    />
                </Segment>;
    } 
    return <Segment placeholder style={{height:'100%', width:'100%', padding:'2rem'}}>
                <Header icon>
                <Icon name='settings' />
                    Once you've uploaded one or more documents, click on a document to update default title and descriptions.
                </Header>
            </Segment>;                                          
}

export function ContractUploadModal(props) {

    const {open, setOpen, handleUploadContract, handleReloadContracts} = props;
    const [files, setFiles] = useState({});
    const [upload_state, setUploadState] = useState(NOT_STARTED);
    const [selected_file_num, selectFileNum] = useState(-1);

    const addFile = (file) => {
        setFiles(files => ({...files, [Object.keys(files).length+1]: file}));
    }
    
    const updateUploadStatus = async (response, file_id) => {
        console.log("Received response: ", response);
        if (response.status === 201) {
            setFileStatus(SUCCESS, file_id);
            return SUCCESS;
        }
        else {
            setFileStatus(FAILED, file_id);
            return FAILED;
        }
    }

    const uploadFiles = async () => {

        console.log("Upload Files!");
        setUploadState(UPLOADING); // Set component state so we can mutate the GUI to show changes

        let uploads = [];
    
        Object.keys(files).forEach((file_id) => {
            setFileStatus(UPLOADING, file_id);
            uploads.push(handleUploadContract(files[file_id]).then((response) => 
            {
                return updateUploadStatus(response, file_id);
            }).catch(err => {
                setFileStatus(FAILED, file_id);
                return FAILED;
            }));
        });

        let results = await Promise.all(uploads);
        _.includes(results, FAILED) ? setUploadState(FAILED) : setUploadState(SUCCESS);
        console.log("Good news... upload results: ", results);
    }

    const removeFile = (file_id) => {
        console.log("Remove", file_id);
        setFiles(files => {
            let new_files = {...files};
            console.log("Predelete new_files: ", new_files);
            delete new_files[`${file_id}`];
            return new_files;
        });
        console.log("Postdelete new_files: ", files);
    }

    let selected_doc = {};
    try {
        selected_doc = files[selected_file_num];
    } catch {}

    const handleChange = ({formData}) => {
        setFiles(files => {
            let selected_doc = {...files[selected_file_num]};
            console.log("Selected doc: ", selected_doc);
            if (selected_doc) {
                selected_doc.meta_json = {...formData}
            }
            return {...files, [selected_file_num]: selected_doc };
        });
    }

    const setFileStatus = (doc_status, file_id) => {
        setFiles(files => {
            let selected_doc = {...files[file_id]};
            console.log("Selected doc: ", selected_doc);
            if (selected_doc) {
                selected_doc.uploaded = doc_status
            }
            return {...files, [file_id]: selected_doc };
        });
    }

    const clearAndReloadOnClose = () => {
        // If handleReloadContracts() was passed to this component... trigger on close
        if (handleReloadContracts) {
            handleReloadContracts();
        }
        // Clear files
        setFiles({});
        setUploadState(NOT_STARTED);
        setOpen(false);
    }

    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => clearAndReloadOnClose()}
            onOpen={() => setOpen(true)}
        >
             <HorizontallyCenteredDiv>
                <div style={{marginTop: '1rem', textAlign: 'left'}}>
                <Header as='h2'>
                    <Icon name='file pdf outline'/>
                    <Header.Content>
                        Upload Your Contracts
                        <Header.Subheader>Select New Contract Files to Upload</Header.Subheader>
                    </Header.Content>
                </Header>
                </div>
            </HorizontallyCenteredDiv>
            <Modal.Content>
                <Segment>
                    <Grid columns={2} stackable textAlign='center'>
                        <Divider vertical>Details:</Divider>
                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{paddingRight:'2rem'}}>
                                <ContractUploadList 
                                    selected_file_num={selected_file_num}
                                    documents={files}
                                    onAddFile={addFile}
                                    onRemove={removeFile}
                                    onSelect={selectFileNum}
                                />
                            </Grid.Column>
                            <Grid.Column style={{paddingLeft:'2rem'}}>
                                <div style={{height:'100%', width: '100%'}}>
                                    <div style={{
                                                height:'40vh',
                                                width: '100%',
                                                padding: '1rem'
                                            }}>
                                        { upload_state === FAILED ?   
                                            <VerticallyCenteredDiv>
                                                <Message negative style={{width: '100%'}}>
                                                    <Message.Header>There was an error uploading your documents. See which document
                                                        icons are red to see which documents failed.</Message.Header>
                                                </Message>
                                            </VerticallyCenteredDiv> : 
                                            <></>
                                        }
                                        { upload_state === SUCCESS ?   
                                            <Message positive style={{width: '100%', height:'100%'}}>
                                                <Message.Header>Your documents were uploaded successfully!</Message.Header>
                                            </Message> : 
                                            <></>
                                        }
                                        { upload_state === UPLOADING ?   
                                            <Message style={{width: '100%', height:'100%'}}>
                                                <Message.Header>Your documents are being uploaded. Please do not close this window.</Message.Header>
                                            </Message> : 
                                            <></>
                                        }
                                        {upload_state === NOT_STARTED ? 
                                            <RightCol
                                                files={files}
                                                selected_file_num={selected_file_num}
                                                selected_doc={selected_doc}
                                                handleChange={handleChange}
                                            />
                                            : <></>
                                        }
                                        
                                    </div> 
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='grey' onClick={() => clearAndReloadOnClose()}>
                    <Icon name='remove' /> Close
                </Button>
                { 
                    files && Object.keys(files).length > 0 && upload_state===NOT_STARTED ? 
                    <Button color='green' inverted onClick={() => uploadFiles()}>
                        <Icon name='checkmark' /> Upload
                    </Button> : 
                    <></>
                }
            </Modal.Actions>
        </Modal>
    );
}
