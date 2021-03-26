import { toast } from 'react-toastify';

import {
    CLEAR_CORPUSES,
    REQUEST_CORPUSES,
    REQUEST_CORPUSES_FAILURE,
    REQUEST_CORPUSES_SUCCESS,
    SELECT_CORPUS,
    SET_CORPUS_PAGE,
    SET_CORPUS_SEARCH_FILTER,
    UNSELECT_CORPUS
} from './constants';

import {
    getCorpuses,
    deleteCorpus,
    removeDocsFromCorpus,
    createCorpus,
    updateCorpus,
    uploadCorpus,
    exportCorpus
} from '../../api/CorpusAPI';

import {
    showSuccessToast,
    showErrorToast
} from '../../redux/app/actions';

export const clearCorpuses = () => async (dispatch) => {
    await dispatch({
      type: CLEAR_CORPUSES
    });
    return Promise.resolve();
}

export const setCorpusSearchTerm = (search_term) => async (dispatch) => {
    await dispatch({
      type: SET_CORPUS_SEARCH_FILTER,
      search_term
    });
    return Promise.resolve();
}

export const setCorpusPage = (selected_page) => async (dispatch) => {
    await dispatch({
        type: SET_CORPUS_PAGE,
        selected_page
    });
    return Promise.resolve();
}

export const selectCorpus = (selected_item) => async (dispatch) => {
    await dispatch({
        type: SELECT_CORPUS,
        selected_item
    });
    return Promise.resolve();
}

export const unselectCorpus = () => async (dispatch) => {
    await dispatch({
        type: UNSELECT_CORPUS,
    });
    return Promise.resolve();
}

export const requestExportCorpus = (corpus_id) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            
            let { token } = getState().auth;
        
            let response = await exportCorpus(token, corpus_id);
            console.log("Response from corpus api: ", response);
            if(response.status===202) {
                console.log("This should trigger toast");
                dispatch(showSuccessToast(`Export is processing. You will receive an e-mail on completion. Go to "Exports" under your user menu to see your exports.`));
                return Promise.resolve(true);
            }
        }   
    }
    catch(e) {
        console.log("Error requestExportCorpus()", corpus_id);
    }

    return Promise.resolve(false);
}

export const requestUploadCorpus = (file) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            
            console.log("requestUploadCorpus()");
            let { token } = getState().auth;
            console.log("Token", token);
        
            let response = await uploadCorpus(token, file);
            console.log("Response from corpus api: ", response);
            if(response.status===200) {
              return Promise.resolve(true);
            }
            
        }   
    }
    catch(e) {
        console.log("Error requestUploadCorpus()", file);
    }

    return Promise.resolve(false);
}


export const requestCreateCorpus = (corpus_json) => async(dispatch, getState) => {
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
        
            let response = await createCorpus(token, corpus_json);
            console.log("Response from corpus api: ", response);
            if(response.status===200) {
              return Promise.resolve(true);
            }
            
        }   
    }
    catch(e) {}

    return Promise.resolve(false);
}


/**
 * Request a page of Corpuss, applying whatever filters are currently in the 
 * redux state store.
 */
export const requestCorpuses = () => async (dispatch, getState) => {
    try {
        let { token } = getState().auth;
        let { selected_page, search_term } = getState().corpuses;
        
        await dispatch({ type: REQUEST_CORPUSES});

        let response = await getCorpuses(token, selected_page, search_term);
        console.log("Response from corpus api: ", response);
        if(response.status===200) {
            await dispatch({
                type: REQUEST_CORPUSES_SUCCESS,
                items: response.data.results,
                count: response.data.count, 
                page_size: response.data.page_size, 
                total_pages: response.data.total_pages
            });
            return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_CORPUSES_FAILURE
            })
        }
    }
    catch(e) {}
    return Promise.resolve(false);
}

export const requestUpdateCorpus = (corpus_obj) => async (dispatch, getState) => {

    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await updateCorpus(token, corpus_obj);
                console.log("Response from contracts api: ", response);
                if(response.status===204) {
                    return Promise.resolve(true);
                }
            }    
            catch (error) {
                console.log("Error trying to update corpus", error);
            }
        }    
    }
    catch(e) {}

    return Promise.resolve(false);
}

export const requestDeleteCorpus = (corpus_id) => async (dispatch, getState) => {

    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await deleteCorpus(token, corpus_id);
                console.log("Response from contracts api: ", response);
            
                if(response.status===204) {
                    return Promise.resolve(true);
                }
            }    
            catch (error) {}
        }    
    }
    catch(e) {}
   
    return Promise.resolve(false);
    
}

export const requestRemoveMultipleContractsFromCorpus = (corpus_id, document_ids) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await removeDocsFromCorpus(token, corpus_id, document_ids);
                console.log("Response from corpus api: ", response);
            
                if(response.status===200) {
                    return Promise.resolve(true);
                }
            }    
            catch (error) {}
        }
    }
    catch(e) {}
   
    return Promise.resolve(false);
}
