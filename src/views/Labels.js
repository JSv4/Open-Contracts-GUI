import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';

import _ from 'lodash';

import { Pagination, Segment, Dimmer, Loader } from 'semantic-ui-react';

import { 
    closeLabelset,
    openLabelset,
    requestCreateLabelset,
    requestDeleteLabelset,
    requestLabelsets,
    requestRemoveMultipleLabelsets,
    selectLabelset,
    setLabelsetSearchTerm,
    unselectLabelset,
    requestUpdateLabelset,
    createLabelForLabelset,
    requestLabelsetLabels
} from '../redux/labelset/actions';

import {
    clearSelectedLabels,
    requestUpdateLabel,
    selectLabel,
    setLabelPage,
    unselectLabel,
    requestDeleteMultipleLabels
} from '../redux/labels/actions';

import { LabelSetEditModal } from '../components/labels/LabelSetEditModal';
import { ConfirmModal } from '../components/shared/modals/ConfirmModal';
import LabelCards from "../components/labels/LabelCards";
import { VerticallyCenteredDiv, HorizontallyCenteredDiv } from '../components/shared/layouts/Wrappers';
import { CreateAndSearchBar } from '../components/shared/controls/CreateAndSearchBar';
import { ObjectCRUDModal } from "../components/shared/modals/ObjectCRUDModal";

import { newLabelSetForm_Ui_Schema, newLabelSetForm_Schema} from '../components/forms/FormSchemas';

import ReactGA from 'react-ga';

const Labels = (props) => {
  
    const dispatch = useDispatch();  
    const {
        labelsets: labelset_store,
        labels: label_store,
        auth: auth_store
    } = useSelector(state => state);

    const [label_id_to_delete, setLabelIdToDelete] = useState(null);
    const [show_multi_delete_confirm, setShowMultiDeleteConfirm] = useState(false);
    const [show_new_label_modal, setShowNewLabelModal] = useState(false);
    const [show_label_set_edit_modal, setShowLabelSetEditModal] = useState(false);

    let { user } = auth_store;

    let {
        selected_items: selected_labelsets, 
        opened_item: opened_labelset,
        items: retrieved_labelsets,
        search_term: labelset_search_term, 
        total_pages: labelset_total_pages,
        selected_page: labelset_selected_page,
        loading: labelsets_loading
    } = labelset_store;

    let {
        selected_items: selected_labels,
        items: retrieved_labels,
        search_term: label_search_term,
        total_pages: label_total_pages,
        selected_page: label_selected_page,
        loading: labels_loading
    } = label_store;

    // Refresh page data when we load the component...
    useEffect(() => {
        dispatch(requestLabelsets());
    }, []);

    const handleUpdateSearch = (labelset_search_term) => {
        dispatch(setLabelsetSearchTerm(labelset_search_term)).then(() => {
        dispatch(requestLabelsets());
        });
    }

    const handleDeleteLabelset = (label_id) => {
        dispatch(requestDeleteLabelset(label_id)).then(() => {
            dispatch(requestLabelsets());
        });
    }

    const handleChangeLabelPage = (page) => {
        dispatch(setLabelPage(page)).then(() => {
            dispatch(requestLabelsets());
        })
    }

    const handleClearSelectedLabels = () => {
        dispatch(clearSelectedLabels());
    }

    const handleSelectLabel = (id) => {
        dispatch(selectLabel(id));
    }

    const handleUnselectLabel = (id) => {
        dispatch(unselectLabel(id));
    }

    const handleSelectLabelClick = (id) => {
        if (!_.includes(selected_labels, id)) {
            handleSelectLabel(id);
        } 
        else {
            handleUnselectLabel(id);
        }
    }

    const handleSelectLabelset = (id) => {
        dispatch(selectLabelset(id));
    }

    const handleUnselectLabelset = (id) => {
        dispatch(unselectLabelset(id));
    }

    const handleSelectLabelsetClick = (id) => {
        if (!_.includes(selected_labelsets, id)) {
        handleSelectLabelset(id);
        } 
        else {
        handleUnselectLabelset(id);
        }
    }

    const handleUpdateLabel = (label_json) => {
        dispatch(requestUpdateLabel(label_json));
    }

    const handleUpdateLabelset = (label_set_json) => {
        dispatch(requestUpdateLabelset(label_set_json)).then(() => {
            dispatch(requestLabelsets()).then(() => {
                setShowLabelSetEditModal(!show_label_set_edit_modal);
            });
        });
    }

    const handleOpenLabelset = (id) => {
        dispatch(openLabelset(id)).then(() => {
            dispatch(requestLabelsetLabels(id)).then(() => { 
                setShowLabelSetEditModal(true);
            });
        });
    }

    const handleCloseLabelset = () => {
        dispatch(closeLabelset());
    }

    const handleDeleteLabels = (ids) => {
        dispatch(requestDeleteMultipleLabels(ids));
    }

    const handleOpenLabelsetClick = (id) => {
        if(opened_labelset !== id) {
        handleOpenLabelset(id)
        } else {
        handleCloseLabelset();
        }
    }

    const handleDeleteMultipleLabelsets = (delete_ids) => {
        dispatch(requestRemoveMultipleLabelsets(delete_ids)).then(() => {
            dispatch(requestLabelsets());
        });
    }

    const handleCreateNewLabelset = (label_set_json) => {
        dispatch(requestCreateLabelset(label_set_json)).then(() => {
            dispatch(requestLabelsets()); //TODO - remove
            setShowNewLabelModal(false);
        }) 
    }

    const handleCreateNewLabel = (label_set_id, label_json) => {
        dispatch(createLabelForLabelset(label_set_id, label_json)).then(() => {
            dispatch(requestLabelsetLabels(label_set_id))
        });
    }

    let label_to_delete = _.find(retrieved_labelsets, {id: label_id_to_delete});
    let multi_delete_message = "Remove the following labels?\n\n" + selected_labelsets && selected_labelsets.length > 0 ? retrieved_labelsets.filter(labelset => _.includes(selected_labelsets, labelset.id))
                                  .reduce(((a, b) => `${a}\n•\t${b.title}`), "") : "";

    let action_buttons = [];
    if (user) {
        action_buttons.push({
            title: "Create Label Set",
            icon: 'plus',
            color: 'blue',
            action_function: () => setShowNewLabelModal(!show_new_label_modal)
        });
        if(selected_labelsets?.length > 0) {
            action_buttons.push({
                title: "Delete Label Set(s)",
                icon: 'remove circle',
                color: 'blue',
                action_function: () => setShowMultiDeleteConfirm(true)
            });
        }
    }

    let open_label_set = _.find(retrieved_labelsets, {id: opened_labelset});

    ReactGA.modalview(`/labelsets/${opened_labelset}`);

    return (
        <Segment style={{margin:'0px', borderRadius:'0px', border:'0px', boxShadow:'0px 0px 0px 0px'}}>
            <Dimmer active={labelsets_loading}>
                <Loader content='Loading Labelsets...' />
            </Dimmer>
            <ConfirmModal
                message={`Are you sure you want to delete label ${label_to_delete?.title}?`}
                yesAction={() => handleDeleteLabelset(label_to_delete?.id)}
                noAction={() => setLabelIdToDelete(null)}
                toggleModal={ () => setLabelIdToDelete(null)}
                visible={Boolean(label_id_to_delete)}
            />
            <ConfirmModal
                message={multi_delete_message}
                yesAction={() => handleDeleteMultipleLabelsets(selected_labelsets)}
                noAction={() => setShowMultiDeleteConfirm(false)}
                toggleModal={() =>setShowMultiDeleteConfirm(false)}
                visible={show_multi_delete_confirm}
            />
            <ObjectCRUDModal
                open={show_new_label_modal}
                mode='CREATE'
                old_instance={{shared_with:[], is_public: false}}
                model_name='labelset'
                ui_schema={newLabelSetForm_Ui_Schema}
                data_schema ={newLabelSetForm_Schema}
                onSubmit={handleCreateNewLabelset}
                toggleModal={() => setShowNewLabelModal(!show_new_label_modal)}
                has_file={true}
                file_field='icon'
                file_label='Labelset Icon'
                file_is_image={true}
                accepted_file_types=".png,.jpg,.gif"    
            />
            { show_label_set_edit_modal ?  
                <LabelSetEditModal
                    label_set={open_label_set}
                    labels={retrieved_labels}
                    selected_labels={selected_labels}
                    toggleSelectLabel={handleSelectLabelClick}
                    open={show_label_set_edit_modal}
                    onLabelCreate={handleCreateNewLabel}
                    onLabelUpdate={handleUpdateLabel}
                    onSave={(data) => handleUpdateLabelset(data)}
                    onDelete={handleDeleteLabels}
                    handleClearSelectedLabels={handleClearSelectedLabels}
                    toggleModal={() => setShowLabelSetEditModal(!show_label_set_edit_modal)} 
                /> : <></>
            }
            <VerticallyCenteredDiv>    
                <HorizontallyCenteredDiv>
                <CreateAndSearchBar
                    onSubmit={(value)=> handleUpdateSearch(value)} 
                    actions={action_buttons}
                    placeholder='Search for label set...'
                    value={labelset_search_term}
                />
                </HorizontallyCenteredDiv>  
                <HorizontallyCenteredDiv>
                    <LabelCards
                        loading={labelsets_loading}
                        onOpen={handleOpenLabelsetClick}
                        items={retrieved_labelsets}
                        onSelect={handleSelectLabelsetClick}
                        selected_items={selected_labelsets}
                        opened_item={opened_labelset}
                        onDelete={setLabelIdToDelete}
                    /> 
                </HorizontallyCenteredDiv>
                <HorizontallyCenteredDiv>
                <Pagination
                    style={{height:'10%', margin: '1rem'}}
                    activePage={labelset_selected_page}
                    onPageChange={(e, { activePage }) => handleChangeLabelPage(activePage)}
                    totalPages={labelset_total_pages}
                />
                </HorizontallyCenteredDiv>
            </VerticallyCenteredDiv>  
        </Segment>
    );
}

export default Labels;
