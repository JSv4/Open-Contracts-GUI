import { pdfjs } from 'react-pdf';

import { Modal, Button, Icon, Statistic } from 'semantic-ui-react';
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { HorizontallyCenteredDiv, VerticallyCenteredDiv } from '../shared/layouts/Wrappers';

import { downloadFile } from '../../utils/helperFunctions';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({url, opened, toggleModal}) {
  
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function changePage(offset) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    }

    function previousPage() {
        changePage(-1);
    }

    function nextPage() {
        changePage(1);
    }

    return (
        <Modal
            closeIcon
            onClose={() => toggleModal()}
            open={opened}
            style={{padding:'1rem'}}
        >
            {url ? <div style={{position:'absolute', right:'2rem', top:'2rem', zIndex:10000}}>
                <Button circular onClick={() => downloadFile(url)}>
                    <Icon name='download' /> Save
                </Button>
            </div> : <></>}
            <div style={{position:'absolute', left:'2rem', bottom:'2rem'}}>
                <Statistic size='mini'>
                    <Statistic.Label>Page</Statistic.Label>
                    <Statistic.Value>{pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}</Statistic.Value>
                </Statistic>
            </div>
            <HorizontallyCenteredDiv>
                <VerticallyCenteredDiv>
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        <Page pageNumber={pageNumber} />
                    </Document>
                    <HorizontallyCenteredDiv>
                        <Button.Group>
                            <Button 
                                content='Previouw'
                                icon='left arrow'
                                labelPosition='left'
                                disabled={pageNumber <= 1} 
                                onClick={previousPage}
                            />
                            <Button
                                content='Next'
                                icon='right arrow'
                                labelPosition='right'
                                disabled={pageNumber >= numPages}
                                onClick={nextPage}
                            />
                        </Button.Group>
                    </HorizontallyCenteredDiv>
                </VerticallyCenteredDiv>
            </HorizontallyCenteredDiv>
        </Modal>
  );
}