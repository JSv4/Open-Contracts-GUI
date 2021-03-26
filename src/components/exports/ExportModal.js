import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { 
    Button,
    Modal, 
    Icon,
    Header,
    Dimmer,
    Loader
} from 'semantic-ui-react';
import _ from 'lodash';

import { 
    requestDeleteExport, 
    requestExports, 
    setExportPage, 
    setExportSearchTerm
} from "../../redux/exports/actions";

import { ExportList } from "./ExportList";
import { CreateAndSearchBar } from "../shared/controls/CreateAndSearchBar";

export default function ExportModal({
    visible,
    toggleModal
}) {

    const dispatch = useDispatch();  
    const {
        exports: export_store, 
        auth: auth_store
    } = useSelector(state => state);

    let {
        items: export_items,
        search_term,
        loading,
        total_pages,
        selected_page
    } = export_store;

     // Refresh page data when we load the component...
    useEffect(() => {
        dispatch(requestExports());
    }, [dispatch]);

    const handleDeleteExport = (export_id) => {
        dispatch(requestDeleteExport(export_id))
    }

    const handleUpdateExportSearchTerm = (search_term) => {
        dispatch(setExportSearchTerm(search_term)).then(() => {
            dispatch(requestExports());
        })
    }

    const handleExportPageChange = (page) => {
        dispatch(setExportPage(page)).then(() => {
            dispatch(requestExports());
        })
    }

    return (
        <Modal
            closeIcon
            open={visible}
            onClose={() => toggleModal()}
        >         
            <Modal.Header>
                <div style={{width:'100%', display:'flex', flexDirection:'row', justifyContent: 'center'}}>
                    <div>
                        <Header as='h2' icon>
                            <Icon name='zip'/>
                            Corpus Exports
                            <Header.Subheader>
                            WARNING - If you have a free account, your exports will be deleted within 24 hours of completion. 
                            </Header.Subheader>
                        </Header>
                    </div>
                </div>  
            </Modal.Header>
            <Modal.Content>
                { 
                    loading ? 
                    <Dimmer active inverted>
                        <Loader inverted>Loading...</Loader>
                    </Dimmer>
                    :
                    <></>
                }
                <div style={{
                    display:'flex',
                    justifyContent: 'center',
                    flexDirection:'row',
                    width:'100%'
                }}>
                    <CreateAndSearchBar
                        style={{margin:'0px'}}
                        onSubmit={(value)=> handleUpdateExportSearchTerm(value)} 
                        placeholder='Search for export...'
                        value={search_term}
                    />
                </div>
                <ExportList
                    exports={export_items}
                    onDelete={handleDeleteExport}
                    onPageChange={handleExportPageChange}
                    total_pages={total_pages}
                    selected_page={selected_page}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='grey' onClick={() => toggleModal()}>
                    <Icon name='remove' /> Close
                </Button> 
            </Modal.Actions>
        </Modal>
    );
}
