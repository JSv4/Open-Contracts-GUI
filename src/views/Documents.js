import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { VerticallyCenteredDiv, HorizontallyCenteredDiv } from '../components/shared/layouts/Wrappers';
import { CreateAndSearchBar } from '../components/shared/controls/CreateAndSearchBar';
import { 
  requestContracts,
  selectContract,
  setContractSearchTerm,
  unselectContract, 
  requestUploadContract,
  requestDeleteContract,
  openContract,
  closeContract, 
  requestDeleteMultipleContracts, 
  requestUpdateContract,
  setContractPage,
  clearSelectedContracts
} from '../redux/contracts/actions';
import _ from 'lodash';

import { Pagination, Loader, Dimmer, Segment } from 'semantic-ui-react';

import { downloadFile } from '../utils/helperFunctions';

import { newDocForm_Schema, newDocForm_Ui_Schema } from '../components/forms/FormSchemas';

import ContractCards from '../components/contracts/ContractCards';
import PdfViewer from '../components/pdf/PdfViewer';
import { ConfirmModal } from '../components/shared/modals/ConfirmModal';
import { AddToCorpusModal } from '../components/corpus/AddToCorpusModal';
import { ContractUploadModal } from "../components/contracts/ContractUploadModal";
import { ObjectCRUDModal } from '../components/shared/modals/ObjectCRUDModal';

import ReactGA from 'react-ga';

const Documents = (props) => {
  
  const dispatch = useDispatch();  

  const {
    contracts,
    auth
  } = useSelector(state => state);

  const [open, setOpen] = useState(false);
  const [add_to_corpus_modal_open, setAddToCorpusModalOpen] = useState(false);
  const [id_to_delete, setIdToDelete] = useState(null);
  const [show_multi_delete_confirm, setShowMultiDeleteConfirm] = useState(false);
  const [contract_id_to_edit, setContractIdToEdit] = useState(-1);

  let {
    opened_item, 
    selected_items,
    items: contract_items,
    search_term
  } = contracts;

  let {
    user, 
    loading: auth_loading
  } = auth;

  // Refresh page when we load the component...
  useEffect(() => {
    dispatch(requestContracts());
  }, []);

  const handleUploadContract = (file_obj) => {    
    return dispatch(requestUploadContract(file_obj.file, file_obj.meta_json));
  }

  const handleDeleteContract = (id) => {
    dispatch(requestDeleteContract(id)).then(() => {
      dispatch(requestContracts());
    });
  }

  const handleMultipleContractDelete = () => {
    dispatch(requestDeleteMultipleContracts(selected_items)).then(() => {
      dispatch(requestContracts());
    });
  }

  const handleSelectClick = (id) => {
    if (!_.includes(contracts.selected_items, id)) {
      handleSelectContract(id);
    } 
    else {
      handleUnselectContract(id);
    }
  }

  const handleOpenContract = (id) => {
    dispatch(openContract(id));
  }

  const handleCloseContract = () => {
    dispatch(closeContract());
  }

  const handleOpenClick = (id) => {
    if(contracts.opened_item !== id) {
      handleOpenContract(id)
    } else {
      handleCloseContract();
    }
  }

  const handleSelectContract = (id) => {
    dispatch(selectContract(id));
  }

  const handleUnselectContract = (id) => {
    dispatch(unselectContract(id));
  }

  const handleUpdateContract = (contract_json) => {
    setContractIdToEdit(-1);
    dispatch(requestUpdateContract(contract_json)).then(() => {
      dispatch(requestContracts());
    });
  }

  const handleUpdateSearch = (search_term) => {
    dispatch(setContractSearchTerm(search_term)).then(() => {
      dispatch(requestContracts());
    });
  }

  const handleRequestContracts = () => {
    dispatch(requestContracts());
  }

  const handleDocumentPageChange = (page) => {
    dispatch(setContractPage(page)).then(() => {
      dispatch(requestContracts());
    })
  }

  const toggleAddToCorpusModal = () => {
    if (add_to_corpus_modal_open) {
      dispatch(clearSelectedContracts());
    }
    setAddToCorpusModalOpen(!add_to_corpus_modal_open);
  }

  const addToCorpusDropDownAction = (id) => {
    dispatch(selectContract(id)).then(() => {
      toggleAddToCorpusModal();
    });
  }


  let action_buttons = [];

  if (user) {
    action_buttons.push({
      title: "Import",
      icon: 'cloud upload',
      color: 'blue',
      action_function: setOpen
    });
  }
  
  if (user && selected_items?.length > 0) {
    
    action_buttons.push({
      title: "Add to Corpus",
      icon: "plus",
      color: 'green',
      action_function: toggleAddToCorpusModal,
    });

    action_buttons.push({
      title: "Delete",
      icon: "trash",
      color: 'red',
      action_function: () =>setShowMultiDeleteConfirm(true),
    }); 

  }

  let object_to_delete = _.find(contract_items, {id: id_to_delete});
  let multi_delete_message = "Delete the following contracts?\n\n" + selected_items && contract_items ? contract_items.filter(item => _.includes(selected_items, item.id))
                                  .reduce(((a, b) => `${a}\n•\t${b.title}`), "") : "";

  const edit_contract = _.find(contract_items, {id: contract_id_to_edit})
  const view_contract = _.find(contract_items, {id: opened_item});
  console.log("View contract", view_contract);

  ReactGA.modalview(`/corpuses/${view_contract?.id}`);

  return (
    <>
      { 
        opened_item!==null ? 
        <PdfViewer
          opened={opened_item!==-1}
          toggleModal={() => handleOpenClick(opened_item)}
          url={view_contract?.pdf_file}/> :
        <></>
      }
      <Segment style={{margin:'0px', borderRadius:'0px', border:'0px', boxShadow:'0px 0px 0px 0px'}}>
        { add_to_corpus_modal_open ? 
          <AddToCorpusModal
            open={add_to_corpus_modal_open}
            toggleModal={toggleAddToCorpusModal}
            documents={contract_items}
            selected_documents={selected_items}
            onRemove={handleSelectClick}
          /> : <></>
        }
        {
          contract_id_to_edit!==-1 ?
          <ObjectCRUDModal
            open={contract_id_to_edit!==-1}
            mode='EDIT'
            old_instance={edit_contract ? edit_contract : {}}
            model_name='document'
            ui_schema={newDocForm_Ui_Schema}
            data_schema={newDocForm_Schema}
            onSubmit={handleUpdateContract}
            toggleModal={() => setContractIdToEdit(-1)}
            has_file={true}
            file_field={'pdf_file'}
            file_label='Document PDF'
            file_is_image={false}
            accepted_file_types=".pdf"    
          /> :
          <></>
        }
        <ConfirmModal
          message={`Are you sure you want to delete ${object_to_delete?.title}?`}
          yesAction={() => handleDeleteContract(object_to_delete?.id)}
          noAction={() => setIdToDelete(null)}
          toggleModal={ () =>setIdToDelete(null)}
          visible={Boolean(object_to_delete)}
        />
        <ConfirmModal
          message={multi_delete_message}
          yesAction={() => handleMultipleContractDelete()}
          noAction={() => setShowMultiDeleteConfirm(false)}
          toggleModal={() =>setShowMultiDeleteConfirm(false)}
          visible={show_multi_delete_confirm}
        />
        <Dimmer active={contracts.loading}>
          <Loader content='Loading Contracts' />
        </Dimmer>
        <ContractUploadModal
          handleReloadContracts={handleRequestContracts}
          handleUploadContract={handleUploadContract}
          onUpload={(data) => console.log("Upload: ", data)}
          open={open}
          setOpen={setOpen}
        />
        <VerticallyCenteredDiv>    
          <HorizontallyCenteredDiv>
            <CreateAndSearchBar
              onSubmit={(value)=> handleUpdateSearch(value)}
              actions={action_buttons}
              placeholder='Search for contract...'
              value={search_term}
            />
          </HorizontallyCenteredDiv>
          <HorizontallyCenteredDiv>
            <ContractCards
              items={contract_items}
              onOpen={handleOpenClick}
              onSelect={handleSelectClick}
              selected_items={selected_items}
              opened_item={opened_item}
              onDelete={setIdToDelete}
              onDownload={downloadFile}
              onEdit={setContractIdToEdit}
              onAdd={user ? addToCorpusDropDownAction : null}
            />
          </HorizontallyCenteredDiv>
          <HorizontallyCenteredDiv>
            <Pagination
                style={{height:'10%', margin: '1rem'}}
                activePage={contracts.selected_page}
                onPageChange={(e, { activePage }) => handleDocumentPageChange(activePage)}
                totalPages={contracts.total_pages}
            />
          </HorizontallyCenteredDiv>
        </VerticallyCenteredDiv>
      </Segment>
    </>
  );
}

export default Documents;
