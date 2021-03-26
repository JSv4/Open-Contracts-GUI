import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { 
  Pagination, 
  Breadcrumb, 
  Segment, 
  Loader, 
  Dimmer, 
  Tab,
} from 'semantic-ui-react';
import _ from 'lodash';

import { downloadFile } from '../utils/helperFunctions';

import { ConfirmModal } from '../components/shared/modals/ConfirmModal';
import CorpusCards from "../components/corpus/CorpusCards";
import AnnotationCards from '../components/annotations/AnnotationCards';
import ContractCards from "../components/contracts/ContractCards";
import Annotator from '../components/annotator/Annotator';
import { VerticallyCenteredDiv, HorizontallyCenteredDiv } from '../components/shared/layouts/Wrappers';
import { CreateAndSearchBar } from '../components/shared/controls/CreateAndSearchBar';
import { ObjectCRUDModal } from '../components/shared/modals/ObjectCRUDModal';
import LabelSetSelector from "../components/shared/controls/LabelSetSelector";

import {
  newCorpusForm_Ui_Schema,
  newCorpusForm_Schema,
  editCorpusForm_Schema,
  editCorpusForm_Ui_Schema
} from '../components/forms/FormSchemas';

import { 
  requestCorpuses,
  setCorpusPage,
  selectCorpus,
  setCorpusSearchTerm,
  unselectCorpus, 
  requestDeleteCorpus,
  requestRemoveMultipleContractsFromCorpus,
  requestCreateCorpus, 
  requestUpdateCorpus,
  requestUploadCorpus,
  requestExportCorpus
} from '../redux/corpuses/actions';

import {
  requestLabelsetLabels
} from '../redux/labelset/actions';

import { 
  requestContractAnnotationsForCorpus, 
  requestContractRelationsForCorpus,
  updateSelectedContractAnnotation, 
  requestContracts,
  selectContract, 
  unselectContract, 
  openContract, 
  closeContract, 
  requestCorpusContracts,
  setContractPage
} from '../redux/contracts/actions';

import {
  closeAnnotation,
  openAnnotation,
  requestCorpusAnnotations,
  requestCreateAnnotation,
  requestDeleteAnnotation,
  setAnnotationPage,
  setAnnotationSearchTerm
} from '../redux/annotations/actions';

import {
  requestCreateRelation,
  requestDeleteRelation
} from '../redux/relations/actions';

import ReactGA from 'react-ga';

// From here: https://sung.codes/blog/2018/12/07/setting-react-hooks-states-in-a-sync-like-manner/
function useAsyncState(initialValue) {
  const [value, setValue] = useState(initialValue);
  const setter = x =>
    new Promise(resolve => {
      setValue(x);
      resolve(x);
    });
  return [value, setter];
}

const CorpusBreadcrumbs = ({selected_corpus, selected_contract, handleUnselectContract, handleNavHome}) => {
  
  return  <Segment style={{width:'100%', margin: '1rem'}}>
            <Breadcrumb>
                <Breadcrumb.Section onClick={()=>handleNavHome()} link active={!selected_contract && !selected_corpus ? 'active' : undefined}>Corpuses</Breadcrumb.Section>
                  {selected_corpus ? 
                    <>
                      <Breadcrumb.Divider />
                      <Breadcrumb.Section onClick={() => handleUnselectContract()} link active = {selected_corpus && !selected_contract}>{selected_corpus.title}</Breadcrumb.Section> 
                    </> : 
                    <></>
                  }
                  {selected_contract ? 
                    <>
                      <Breadcrumb.Divider />
                        <Breadcrumb.Section active>{selected_contract.description}</Breadcrumb.Section>
                    </> : 
                    <></>
                    }
            </Breadcrumb>
          </Segment>;
}

const Corpuses = (props) => {
  
  const dispatch = useDispatch();  
  const {
    corpuses: corpuses_store, 
    contracts: contracts_store,
    labels: label_store,
    labelsets: labelset_store,
    annotations: annotation_store,
    relations: relation_store,
    auth: auth_store
  } = useSelector(state => state);

  const fileRef = useRef(null);

  const [corpus_id_to_delete, setCorpusIdToDelete] = useState(null);
  const [contract_id_to_remove, setContractIdToRemove] = useState(-1);
  const [show_multi_delete_confirm, setShowMultiDeleteConfirm] = useState(false);
  const [show_new_corpus_modal, setShowNewCorpusModal] = useState(false);
  const [show_annotator, setShowAnnotator] = useState(false);
  const [show_annotations_for_label_id, setShowAnnotationsForLabelId] = useAsyncState("");
  const [corpus_id_to_edit, setCorpusIdToEdit] = useState(-1);
  const [corpus_id_to_view, setCorpusIdToView] = useState(-1);
  const [active_tab, setActiveTab] = useState(0);
  const [contract_to_view_annotations, setContractToViewAnnotations] = useState(null);


  let { user } = auth_store;

  let {
    selected_item: selected_corpus, 
    items: corpuses,
    search_term, 
    total_pages: total_corpus_pages,
    selected_page: selected_corpus_page,
    loading: corpuses_loading
  } = corpuses_store;

  let {
    opened_item: opened_contract,
    selected_items: selected_contracts, 
    items: contracts,
    loading: corpus_contracts_loading,
    selected_page: selected_contract_page, 
    total_pages: total_contract_pages
  } = contracts_store;

  let {
    items: labelsets
  } = labelset_store;

  let {
    items: labels,
    loading: labels_loading,
    opened_item: opened_label
  } = label_store;

  let {
    items: annotations,
    loading: annotations_loading,
    total_pages: total_annotation_pages,
    search_term: annotation_search_term,
    selected_page: selected_annotation_page,
    opened_item: opened_annotation
  } = annotation_store;

  let {
    items: relations
  } = relation_store;

  let contract = contract_to_view_annotations ? contract_to_view_annotations : _.find(contracts, {id: opened_contract});
  let corpus = _.find(corpuses, {id: selected_corpus});
  let edit_corpus = _.find(corpuses, {id: corpus_id_to_edit})
  let view_corpus = _.find(corpuses, {id: corpus_id_to_view});
  let label_set = _.find(labelsets, {id: corpus?.label_set?.id ? corpus.label_set.id : -1}); 

  console.log("Loaded contract: ", contract, opened_contract);

  let active_contract_labels = [];
  let active_contract_relations = [];

  const onFileChange = (event) => {
    console.log("Event.target.files is", event.target.files);
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        console.log("Dispatch load", e.target.result);
        dispatch(requestUploadCorpus(e.target.result));
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  const onFileClick = () => {
    fileRef.current.click();
  };

  // Refresh page data when we load the component...
  useEffect(() => {
    dispatch(requestCorpuses());
  }, [dispatch]);

  const handleNavHome = () => {
    Promise.all([
      dispatch(unselectCorpus()),
      dispatch(unselectContract())
    ]);
  }

  const handleExportCorpus = (id) => {
    dispatch(requestExportCorpus(id));
  }

  const handleSelectCorpus = (id) => {
    let corpus = _.find(corpuses, {id});
    if (corpus.label_set) {
      dispatch(selectCorpus(id)).then(() => {
        Promise.all([
          dispatch(requestContracts(id)), 
          dispatch(requestCorpusAnnotations(id, show_annotations_for_label_id)),
          dispatch(requestLabelsetLabels(corpus?.label_set?.id))
        ]);
      });
    } 
    else {
      dispatch(selectCorpus(id)).then(() => {
        dispatch(requestContracts(id));
      });
    }  
  }

  const handleChangeContractPage = (page) => {
    dispatch(setContractPage(page)).then(() => {
      dispatch(requestContracts(selected_corpus));
    });
  }

  const handleChangeCorpusPage = (page) => {
    dispatch(setCorpusPage(page)).then(() => {
      dispatch(requestCorpuses());
    })
  }

  const handleUpdateSearch = (search_term) => {
    dispatch(setCorpusSearchTerm(search_term)).then(() => {
      dispatch(requestCorpuses());
    });
  }

  const handleAnnotationPageChange = (page) => {
    dispatch(setAnnotationPage(page)).then(() => {
      dispatch(requestCorpusAnnotations(selected_corpus, show_annotations_for_label_id));
    })
  }

  const handleAnnotationSearch = (search_term) => {
    dispatch(setAnnotationSearchTerm(search_term)).then(() => {
      dispatch(requestCorpusAnnotations(selected_corpus, show_annotations_for_label_id));
    });
  }

  const handleAnnotationLabelFilter = (label_id) => {
    setShowAnnotationsForLabelId(label_id).then(() => {
      dispatch(requestCorpusAnnotations(selected_corpus, label_id));
    })
  }

  const handleRequestCorpuses = () => {
    dispatch(requestCorpuses());
  }

  const handleUpdateCorpus = (corpus_obj) => {
    dispatch(requestUpdateCorpus(corpus_obj)).then(() => {
      setCorpusIdToEdit(-1);
      dispatch(requestCorpuses());
    })
  }

  const handleDeleteCorpus = (corpus_id) => {
    dispatch(requestDeleteCorpus(corpus_id)).then(() => {
      dispatch(requestCorpuses());
    });
  }

  const handleSelectContract = (doc_id) => {
    dispatch(selectContract(doc_id));
  }

  const handleUnselectContract = (id) => {
    dispatch(unselectContract(id));
  }

  const handleUpdateAnnotation = (annotation_json) => {
    dispatch(updateSelectedContractAnnotation(annotation_json));
  }

  const handleSelectContractClick = (id) => {
    if (!_.includes(selected_contracts, id)) {
      handleSelectContract(id);
    } 
    else {
      handleUnselectContract(id);
    }
  }

  const handleOpenAnnotation = (annotation_id) => {
    return dispatch(openAnnotation(annotation_id))
  }

  const handleOpenContract = (doc_id) => {
    console.log("handleOpenContract", doc_id);
    dispatch(openContract(doc_id)).then(() => {
      Promise.all([
        dispatch(requestContractRelationsForCorpus(doc_id, selected_corpus)), 
        dispatch(requestContractAnnotationsForCorpus(doc_id, selected_corpus))
      ]).then(() => {
        setShowAnnotator(true);
      })
    })
  }

  const handleCloseContract = () => {
    Promise.all([
      dispatch(closeContract()),
      dispatch(closeAnnotation())
    ]).then(() => {
      setShowAnnotator(false);
    })
  }

  const handleOpenContractClick = (id) => {
    if(contracts.opened_item !== id) {
      console.log("handleOpenContractClick for id", id);
      handleOpenContract(id)
    } else {
      handleCloseContract();
    }
  }

  const handleRemoveContracts = (delete_ids) => {
    dispatch(requestRemoveMultipleContractsFromCorpus(selected_corpus, delete_ids)).then(() => {
      dispatch(requestCorpusContracts(selected_corpus));
    });
  }

  const handleCreateNewCorpus = (corpus_json) => {
    dispatch(requestCreateCorpus(corpus_json)).then(() => {
      dispatch(requestCorpuses());
      setShowNewCorpusModal(false);
    }) 
  }

  const handleCreateNewAnnotation = (annotation_json) => {
    dispatch(requestCreateAnnotation(annotation_json));
  }

  const handleDeleteAnnotation = (annotation_id) => {
    dispatch(requestDeleteAnnotation(annotation_id));
  }

  const handleCreateNewRelation = (relation_json) => {
    dispatch(requestCreateRelation(relation_json));
  }

  const handleDeleteRelation = (relation_id) => {
    dispatch(requestDeleteRelation(relation_id));
  }


  let contract_to_remove = _.find(contracts, {id: contract_id_to_remove});
  let corpus_to_delete = _.find(corpuses, {id: corpus_id_to_delete});
  let multi_remove_message = "Remove the following documents?\n\n" + selected_contracts && contracts ? contracts.filter(item => _.includes(selected_contracts, item.id))
                                  .reduce(((a, b) => `${a}\n•\t${b.title}`), "") : "";

  let can_edit_corpus = _.includes(corpus?.my_permissions, `change_corpus`);

  let action_buttons = [];
  if (user) {
    if(!selected_corpus) {
      action_buttons = [{
        title: "Create Corpus",
        icon: 'plus',
        color: 'blue',
        action_function: () => setShowNewCorpusModal(true)
      }];
    } 
    else {
      if(selected_contracts?.length > 0) {
        
        action_buttons = [{
          title: "Remove Contract(s)",
          icon: 'remove circle',
          color: 'blue',
          action_function: () => setShowMultiDeleteConfirm(true)
        }];
      }
    }

    action_buttons.push({
      title: "Import Corpus Zip",
      icon: "cloud upload",
      action_function: () => onFileClick()
    });

  }

  let panes = [ {
    menuItem: 'Contracts',
    render: () => 
      <Tab.Pane 
        attached={false}
        style={{padding: '0px'}}
      >
        <ContractCards
            style={{margin:'1rem', padding:'1rem', minHeight:'70vh'}}
            loading={corpus_contracts_loading || labels_loading}
            onOpen={handleOpenContractClick}
            items={contracts}
            onSelect={handleSelectContractClick}
            selected_items={selected_contracts}
            opened_item={opened_contract}
            onDelete={setContractIdToRemove}
            onDownload={downloadFile}
            delete_caption="Remove from Corpus"
            download_caption="Download Document PDF"
            edit_caption="Edit Annotations"
          />
    </Tab.Pane>
  }, {
    menuItem:'Annotations', 
    render: () => 
    <Tab.Pane>
      <AnnotationCards
        loading={annotations_loading}
        items={annotations}
        search_term={annotation_search_term}
        labels={labels}
        show_annotations_for_label_id={show_annotations_for_label_id}
        onSearchChange={handleAnnotationSearch}
        onLabelChange={handleAnnotationLabelFilter}
        onSelectAnnotation={handleOpenAnnotation}
        setContractToViewAnnotations={setContractToViewAnnotations}
        handleOpenContractClick={handleOpenContractClick}
        selected_annotation={opened_annotation}
      />
    </Tab.Pane>
  }];

  ReactGA.modalview('/corpuses');

  return (
    <Segment style={{margin:'0px', borderRadius:'0px', border:'0px', boxShadow:'0px 0px 0px 0px'}}>
       <input 
          ref={fileRef}
          id='uploadFile'
          hidden
          type="file"
          onChange={onFileChange}
        />
      <Dimmer active={corpuses_loading}>
        <Loader content='Loading Corpuses...' />
      </Dimmer>
      <ConfirmModal
        message={`Are you sure you want to delete corpus ${corpus_to_delete?.title}?`}
        yesAction={() => handleDeleteCorpus(corpus_to_delete?.id)}
        noAction={() => setCorpusIdToDelete(null)}
        toggleModal={ () => setCorpusIdToDelete(null)}
        visible={Boolean(corpus_to_delete)}
      />
      <ConfirmModal
        message={multi_remove_message}
        yesAction={() => handleRemoveContracts(selected_contracts)}
        noAction={() => setShowMultiDeleteConfirm(false)}
        toggleModal={() =>setShowMultiDeleteConfirm(false)}
        visible={show_multi_delete_confirm}
      />
      <ConfirmModal
        message={`Are you sure you want to remove contract ${contract_to_remove?.title} from corpus?`}
        yesAction={() => handleRemoveContracts([contract_id_to_remove])}
        noAction={() => setContractIdToRemove(-1)}
        toggleModal={() => setContractIdToRemove(-1)}
        visible={contract_id_to_remove!=-1}
      />
      { show_new_corpus_modal ?
        <ObjectCRUDModal
          open={show_new_corpus_modal}
          mode='CREATE'
          old_instance={{shared_with:[], is_public: false}}
          model_name='corpus'
          ui_schema={newCorpusForm_Ui_Schema}
          data_schema ={newCorpusForm_Schema}
          onSubmit={handleCreateNewCorpus}
          toggleModal={() => setShowNewCorpusModal(!show_new_corpus_modal)}
          has_file={true}
          file_field={'icon'}
          file_label='Corpus Icon'
          file_is_image={true}
          accepted_file_types="image/*"  
        >
            <LabelSetSelector label_set={null}/>
        </ObjectCRUDModal>: <></>
      }
      { corpus_id_to_edit!==-1 ?
        <ObjectCRUDModal
          open={corpus_id_to_edit!==-1}
          mode='EDIT'
          old_instance={edit_corpus ? edit_corpus : {}}
          model_name='corpus'
          ui_schema={editCorpusForm_Ui_Schema}
          data_schema={editCorpusForm_Schema}
          onSubmit={handleUpdateCorpus}
          toggleModal={() => setCorpusIdToEdit(-1)}
          has_file={true}
          file_field={'icon'}
          file_label='Corpus Icon'
          file_is_image={true}
          accepted_file_types="image/*"    
        >
          <LabelSetSelector label_set={edit_corpus.label_set}/>
        </ObjectCRUDModal>: <></>
      }
       { corpus_id_to_view!==-1 ?
        <ObjectCRUDModal
          open={corpus_id_to_view!==-1}
          mode='VIEW'
          old_instance={view_corpus ? view_corpus : {}}
          model_name='corpus'
          ui_schema={editCorpusForm_Ui_Schema}
          data_schema={editCorpusForm_Schema}
          toggleModal={() => setCorpusIdToView(-1)}
          has_file={true}
          file_field={'icon'}
          file_label='Corpus Icon'
          file_is_image={true}
          accepted_file_types="image/*"   
        >
          <LabelSetSelector label_set={view_corpus.label_set}/>
        </ObjectCRUDModal>: <></>
      }
      <VerticallyCenteredDiv>    
        <HorizontallyCenteredDiv>
          <CreateAndSearchBar
            onSubmit={(value)=> handleUpdateSearch(value)} 
            actions={action_buttons}
            placeholder='Search for corpus...'
            value={search_term}
          />
        </HorizontallyCenteredDiv>  
        { selected_corpus ? <HorizontallyCenteredDiv>
          <CorpusBreadcrumbs
            selected_corpus={corpus}
            selected_contract={contract}
            handleNavHome={handleNavHome}
            handleUnselectContract={handleSelectContractClick}
          />
        </HorizontallyCenteredDiv> : <></> }
        {
          show_annotator ? <Annotator
                              label_set_labels={labels}
                              document_labelled_text={annotations}
                              document_label_relations={relations}
                              document_id={opened_contract}
                              corpus_id={selected_corpus}
                              createRelation={handleCreateNewRelation}
                              deleteRelation={handleDeleteRelation}
                              createAnnotation={handleCreateNewAnnotation}
                              deleteAnnotation={handleDeleteAnnotation}
                              url={contract?.pdf_file ? contract.pdf_file : ""}
                              onSave={(data) => handleUpdateAnnotation(data)}
                              toggleModal={handleOpenContractClick}
                              open={Boolean(opened_contract)}
                              labels={active_contract_labels}
                              relations={active_contract_relations}
                              read_only={!can_edit_corpus}
                              open_on_annotation_id={opened_annotation}
                            /> : <></>

        }
        { selected_corpus ?            
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            height: '100%', 
            marginLeft: '1rem',
            marginRight: '1rem'
          }}>
            <Tab 
              style={{width:'100%'}}
              activeIndex={active_tab}
              onTabChange={(e, { activeIndex }) => setActiveTab(activeIndex)}
              panes={panes}
            /> 
          </div>
          :
          <HorizontallyCenteredDiv>
            <CorpusCards
              loading={corpuses_loading}
              items={corpuses}
              on_select={handleSelectCorpus}
              selected_item={selected_corpus}
              onDelete={setCorpusIdToDelete}
              onEdit={setCorpusIdToEdit}
              onView={setCorpusIdToView}
              onExport={handleExportCorpus}
            /> 
          </HorizontallyCenteredDiv>
        }
        <HorizontallyCenteredDiv>
          <Pagination
            style={{height:'10%', margin: '1rem'}}
            activePage={ selected_corpus ? active_tab===0 ? selected_contract_page : selected_annotation_page : selected_corpus_page}
            onPageChange={ 
              selected_corpus ? 
                active_tab===0 ? 
                  (e, { activePage }) => handleChangeContractPage(activePage) : 
                  (e, { activePage }) => handleAnnotationPageChange(activePage) : 
                (e, { activePage }) => handleChangeCorpusPage(activePage)
            }
            totalPages={ selected_corpus ? active_tab===0 ? total_contract_pages : total_annotation_pages : total_corpus_pages}
          />
        </HorizontallyCenteredDiv>
      </VerticallyCenteredDiv>  
    </Segment>
  );
}

export default Corpuses;
