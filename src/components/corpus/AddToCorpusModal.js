import React, { useState, useEffect } from 'react';
import { 
    Button,
    Modal, 
    Form, 
    Loader, 
    Dimmer,
    Pagination,
    Segment,
    Header,
    Icon,
    Card,
    Image,
    Label,
    List,
    Message
} from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import { searchCorpuses, addDocsToCorpus } from '../../api/CorpusAPI';
import { HorizontallyCenteredDiv } from '../shared/layouts/Wrappers';
import _ from 'lodash';

import { FAILED, SUCCESS } from '../contracts/ContractUploadModal';

const SELECT_VIEW = 'SELECT_VIEW';
const CONFIRM_VIEW = 'CONFIRM_VIEW';
const STATUS_VIEW = 'STATUS_VIEW';

const NOT_STARTED = 'NOT_STARTED';
const STARTED = 'STARTED';
const SUCCESS_STATUS = 'SUCCESS_STATUS';
const FAILURE_STATUS = 'FAILURE_STATUS';

function DocumentItem({document, onRemove}) {
    return (
        <List.Item>
            <div style={{float:'right'}}>
                <Icon name='trash' color='red' onClick={onRemove}/>
            </div>
            <List.Icon 
                name='file alternate'
                size='large'
                color='blue'
                verticalAlign='middle'
            />
            <List.Content>
                    <List.Header>{document.title}</List.Header>
                    <List.Description>
                        <Label>
                            <Icon name='at' />Author: {document?.creator?.email}
                        </Label>
                        <Label>
                            <Icon name='users' />{document?.shared_with?.length} Shares
                        </Label>
                    </List.Description>
            </List.Content>
        </List.Item>
    );
}      

function CorpusItem({corpus, selected, onClick}) {
    console.log("Make a corpus item for corpus: ", corpus);
    return (
        <Card style={selected ? {backgroundColor: '#e2ffdb'} : {}} onClick={() => onClick(corpus)}>
            <Card.Content>
                <Image
                    floated='right'
                    size='mini'
                    src={corpus?.icon}
                />
                <Card.Header>{corpus?.title}</Card.Header>
                <Card.Meta>
                    <em>Author: </em>{corpus?.creator?.email}
                </Card.Meta>
                <Card.Description>
                    {corpus?.description}
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Label>
                    <Icon name='file text outline'/> {corpus?.document_count} Documents
                </Label>
                <Label>
                    <Icon name='users' />{corpus?.share_count} Shares
                </Label>
                <Label>
                    <Icon name='tags'/> Label Set: {corpus?.label_set_name}
                </Label>
            </Card.Content>
        </Card>
       );
}

function ConfirmDocuments({
    documents,
    selected_documents,
    onRemove, 
}) {
    const selected_docs = _.filter(documents, (doc) => _.includes(selected_documents, doc.id));
    const items = selected_docs && Object.keys(documents).length > 0 ? selected_docs.map((document) => {    
        return <DocumentItem
            key={document.id}
            onRemove={() => onRemove(document.id)}
            document={document}
        />
    }) : [<></>];
    return <List style={{height:'100%', width:'100%'}} celled>{items}</List>;
}


function SelectCorpus({ 
    selected_corpus,
    onClick,
    searchCorpus, 
    setSearchTerm,
    search_term,
    changePage,
    page,
    page_count,
    results,
    loading}) {
    
        const options = results && results.length > 0 ? 
        results.map((item, index) => <CorpusItem 
                                        key={index}
                                        corpus={item}
                                        selected={selected_corpus?.id === item?.id}
                                        onClick={onClick}/>) :
        [];

        return (
            <Segment.Group>
                <Segment raised>
                    <div style={{width:'25vw'}}>
                        <Form onSubmit={() => searchCorpus()}>
                            <Form.Input
                                icon='search'
                                placeholder='Search for corpus...'
                                onChange={(data)=> setSearchTerm(data.target.value)}
                                value={search_term}
                                style={{borderRadius: '.25rem'}}
                            />
                        </Form>
                    </div>
                </Segment>
                <Segment raised style={{height:'40vh', overflowY:'scroll'}}>
                    {loading ? <Dimmer active inverted>
                        <Loader inverted>Loading</Loader>
                    </Dimmer> : <></> }
                    <Card.Group itemsPerRow={2}>
                        {options}
                    </Card.Group>
                </Segment>
                <Segment style={{padding:'.5rem'}}>
                    <HorizontallyCenteredDiv>
                        <Pagination
                            style={{margin: '0px', padding:'0px'}}
                            activePage={page}
                            onPageChange={(e, { activePage }) => changePage(activePage)}
                            totalPages={page_count}
                        />
                    </HorizontallyCenteredDiv>
                </Segment>
            </Segment.Group>
        );
    
}

export function AddToCorpusModal({
    open,
    documents, 
    selected_documents,
    toggleModal,
    onRemove,
    onConfirmAdd,
}) {

    const auth = useSelector(state => state.auth);

    const [page, setPage] = useState(1);
    const [page_count, setPageCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [search_term, setSearchTerm] = useState("");
    const [view, setView] = useState(SELECT_VIEW);
    const [selected_corpus, setSelectedCorpus] = useState({});
    const [status, setStatus] = useState(NOT_STARTED);

    let { token } = auth;
    
    async function hanleAddDocsToCorpus() { 
        setView(STATUS_VIEW);
        setStatus(STARTED);
        
        if (selected_corpus) {
            let request = await addDocsToCorpus(token, selected_corpus.id, selected_documents);
            console.log("Add document request results", request);
            if (request.status==200) {
                setStatus(SUCCESS_STATUS);
            }
            else {
                setStatus(FAILURE_STATUS);
            }
        }
    }

    async function searchCorpus() {

        setLoading(true);
        
        try {
            let request = await searchCorpuses(token, page, search_term);
            if (request.status===200) {
                setResults(request.data.results);
                setPageCount(request.data.total_pages)
                setPage(1);
                setLoading(false);
                return request;
            }
        }
        catch(e) {}
       
        setLoading(false);
        return {};
    }    

    // Refresh page when we load the component...
    useEffect(() => {
        if (token) {
            searchCorpus();
        }
    }, []);

    const onClose = () => {
        setPage(1);
        setPageCount(1);
        setLoading(false);
        setResults([]);
        setSearchTerm("");
        setView(SELECT_VIEW);
        setSelectedCorpus({});
        setStatus(NOT_STARTED);
        toggleModal();
    }

    const changePage = (page) => {
        setPage(page);
        searchCorpus();
    }

    const goForward = () => {
        setView(CONFIRM_VIEW);
    }

    const goBackward = () => {
        setView(SELECT_VIEW);
    }

    const onConfirm = () => {
        onConfirmAdd();
    }

    const renderSwitch = (view) => {
        switch(view) {
            case SELECT_VIEW:
                return <SelectCorpus
                    selected_corpus={selected_corpus}
                    onClick={setSelectedCorpus}
                    searchCorpus={searchCorpus}
                    setSearchTerm={setSearchTerm}
                    search_term={search_term}
                    changePage={changePage}
                    page={page}
                    page_count={page_count}
                    loading={loading}
                    results={results}
                />;
            case CONFIRM_VIEW:
                return <ConfirmDocuments
                    documents={documents}
                    selected_documents={selected_documents}
                    onRemove={onRemove}
                />;
            case STATUS_VIEW:
                if (status === STARTED) {
                    return <Dimmer active inverted>
                                <Loader inverted>Adding to Corpus...</Loader>
                            </Dimmer>; 
                }
                if (status === SUCCESS_STATUS) {
                    return <Message positive>
                                <Message.Header>Successfully Added to Corpus</Message.Header>
                            </Message>;
                }
                else if (status === FAILURE_STATUS)
                    return <Message negative>
                            <Message.Header>Sorry, Unable to Link These Documents</Message.Header>
                        </Message>;
            default:
                return <></>;
        }
      }
    
    const navButtons = (view) => {
        let buttons = [<Button key='cancel' icon='cancel' content='Close' onClick={() => onClose()}/>];
        switch(view) {
            case SELECT_VIEW:
                return [ 
                        ...buttons,
                        <Button 
                            key="SelectButton"
                            labelPosition='right'
                            icon='right chevron'
                            content='Select'
                            color='green'
                            onClick={() => goForward()}
                        />
                        ];
            case CONFIRM_VIEW:
                return [ 
                        <Button
                            key="BackButton"
                            labelPosition='left'
                            icon='left chevron'
                            content='Back'
                            color='red'
                            onClick={() => goBackward()}
                        />,
                        ...buttons,
                        <Button 
                            key="ForwardButton"
                            labelPosition='right'
                            icon='linkify'
                            content='Add'
                            color='green'
                            onClick={() => hanleAddDocsToCorpus()}
                        />
                    ];
            case STATUS_VIEW:
                return buttons;
            default:
                return buttons;
        }
    }

    const modalHeader = (view) => {
        switch(view) {
            case SELECT_VIEW:
                return  <Header as='h2'>
                            <Icon name='file text outline'/>
                            <Header.Content>
                                Add to Corpus
                                <Header.Subheader>Add selected documents to a corpus</Header.Subheader>
                            </Header.Content>
                        </Header>;
            case CONFIRM_VIEW:
                return <Header as='h2'>
                            <Icon name='file text outline'/>
                            <Header.Content>
                                Confirm Selected Documents
                                <Header.Subheader>Confirm you want to add the documents below to corpus</Header.Subheader>
                            </Header.Content>
                        </Header>;
            default:
                return <></>;
        }
    }

    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => onClose()}
        >   
            <div style={{marginTop: '1rem', textAlign: 'left'}}>
               {modalHeader(view)}
            </div>
            <Modal.Content>
                {renderSwitch(view)}   
            </Modal.Content>
            <Modal.Actions>
                <Button.Group>
                    {navButtons(view)}
                </Button.Group>
            </Modal.Actions>
        </Modal>
    );
}
