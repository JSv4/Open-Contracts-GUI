import {
    CLEAR_CONTRACTS,
    CLOSE_CONTRACT,
    OPEN_CONTRACT,
    REQUEST_CONTRACTS,
    REQUEST_CONTRACTS_FAILURE,
    REQUEST_CONTRACTS_SUCCESS,
    SELECT_CONTRACTS,
    SET_CONTRACTS_LOADING,
    SET_CONTRACT_PAGE,
    SET_CONTRACT_SEARCH_FILTER,
    UNSELECT_CONTRACTS,
    UPDATE_CONTRACT,
    CLEAR_SELECTED_CONTRACTS
} from './constants';

import {
    REQUEST_ANNOTATIONS,
    REQUEST_ANNOTATIONS_FAILURE,
    REQUEST_ANNOTATIONS_SUCCESS,
} from '../annotations/constants';

import {
    REQUEST_RELATIONS,
    REQUEST_RELATIONS_FAILURE, 
    REQUEST_RELATIONS_SUCCESS
} from '../relations/constants';

import {
    deleteContract,
    deleteMultipleContracts,
    getContracts,
    uploadContract,
    getCorpusContracts,
    getContractAnnotations,
    getContractRelations,
    updateContractRequest
} from '../../api/ContractsAPI';
import { updateDocAnnotationDataForCorpus } from '../../api/AnnotationAPI';


export const updateContract = (contract_obj) => async (dispatch) => {
    await dispatch({
        type: UPDATE_CONTRACT, 
        contract_obj
    });
    return Promise.resolve(true);
}

export const clearContracts = () => async (dispatch) => {
    await dispatch({
      type: CLEAR_CONTRACTS
    });
    return Promise.resolve(true);
}

export const setContractSearchTerm = (search_term) => async (dispatch) => {
    await dispatch({
      type: SET_CONTRACT_SEARCH_FILTER,
      search_term
    });
    return Promise.resolve(true);
}

export const setContractPage = (selected_page) => async (dispatch) => {
    await dispatch({
        type: SET_CONTRACT_PAGE,
        selected_page
    });
    return Promise.resolve(true);
}

export const clearSelectedContracts = () => async (dispatch) => {
    await dispatch({
        type: CLEAR_SELECTED_CONTRACTS
    });
    return Promise.resolve(true);
}

export const selectContract = (selected_item) => async (dispatch) => {
    await dispatch({
        type: SELECT_CONTRACTS,
        selected_items: [selected_item]
    });
    return Promise.resolve(true);
}

export const unselectContract = (unselected_item) => async (dispatch) => {
    await dispatch({
        type: UNSELECT_CONTRACTS,
        unselected_items: [unselected_item]
    });
    return Promise.resolve(true);
}

export const openContract = (opened_item) => async (dispatch) => {
    await dispatch({
        type: OPEN_CONTRACT,
        opened_item
    });
    return Promise.resolve(true);
}

export const closeContract = () => async (dispatch) => {
    await dispatch({
        type: CLOSE_CONTRACT,
    });
    return Promise.resolve(true);
}


export const requestContractRelationsForCorpus = (document_id, corpus_id) => async (dispatch, getState) => {
    
    try{
        let { token } = getState().auth;
        await dispatch({ type: REQUEST_RELATIONS});

        let response = await getContractRelations(token, document_id, corpus_id);
        console.log("Response from requestContractRelationsForCorpus(): ", response);
        if(response.status===200) {
            await dispatch({
                type: REQUEST_RELATIONS_SUCCESS,
                items: response.data,
                count: response.data.length, 
                page_size: response.data.length, 
                total_pages: 1
            });
            return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_RELATIONS_FAILURE
            })
        }
    }
    catch (e) {
        console.log(`requestContractRelationsForCorpus() - error: ${e}`)
    }
   
    return Promise.resolve(false);
}


export const requestContractAnnotationsForCorpus = (document_id, corpus_id) => async (dispatch, getState) => {
    
    try{
        let { token } = getState().auth;
        await dispatch({ type: REQUEST_ANNOTATIONS});

        let response = await getContractAnnotations(token, document_id, corpus_id);
        console.log("Response from requestContractAnnotationsForCorpus(): ", response);
        if(response.status===200) {
          await dispatch({
              type: REQUEST_ANNOTATIONS_SUCCESS,
              items: response.data,
              count: response.data.length, 
              page_size: response.data.length, 
              total_pages: 1
          });
          return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_ANNOTATIONS_FAILURE
            })
        }
    }
    catch (e) {
        console.log(`requestContractAnnotationsForCorpus() - error: ${e}`)
    }
   
    return Promise.resolve(false);
}

/**
 * Given a corpus, request all of the related documents. This has no pagination, so set 
 * page count to 1 and page length to item count
 */
export const requestCorpusContracts = (corpus_id) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
            await dispatch({ type: REQUEST_CONTRACTS});
    
            let response = await getCorpusContracts(token,corpus_id);
            console.log("Response from getCorpusContracts(): ", response);
            if(response.status===200) {
              await dispatch({
                  type: REQUEST_CONTRACTS_SUCCESS,
                  items: response.data,
                  count: response.data.length, 
                  page_size: response.data.length, 
                  total_pages: 1
              });
              return Promise.resolve(true);
            }
            else {
                await dispatch({
                    type: REQUEST_CONTRACTS_FAILURE
                })
            }
        }
    }
    catch(e) {console.log(`requestCorpusContracts() - error: ${e}`)}
   
    return Promise.resolve(false);
}

/**
 * Request a page of contracts, applying whatever filters are currently in the 
 * redux state store.
 */
export const requestContracts = (for_corpus_id) => async (dispatch, getState) => {
    try {
        let { token } = getState().auth;
        let { selected_page, search_term } = getState().contracts;
        
        await dispatch({ type: REQUEST_CONTRACTS});

        let response = await getContracts(token, selected_page, search_term, for_corpus_id);
        console.log("Response from contracts api: ", response);
        if(response.status===200) {
            await dispatch({
                type: REQUEST_CONTRACTS_SUCCESS,
                items: response.data.results,
                count: response.data.count, 
                page_size: response.data.page_size, 
                total_pages: response.data.total_pages
            });
            return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_CONTRACTS_FAILURE
            })
        }
    }
    catch(e) {console.log(`requestContracts () - error: ${e}`)} 

    return Promise.resolve(false);
}


/**
 * Request a page of contract results, applying whatever filters are currently in the 
 * redux state store.
 */
export const updateSelectedContractAnnotation = (annotation_json) => async (dispatch, getState) => {
    try{
        if (getState().auth.token) {

            let { auth, contracts, corpuses } = getState();
            let { token } = auth;
            let { opened_item: contract_id } = contracts;
            let { selected_item: corpus_id } = corpuses;
            
            await dispatch({ type: REQUEST_CONTRACTS});
    
            let response = await updateDocAnnotationDataForCorpus(token, contract_id, corpus_id, annotation_json);
            console.log("Response from contracts api: ", response);
            if(response.status===200) {
                console.log("Successful update", annotation_json);
                return Promise.resolve(true);
            }
            else {
                await dispatch({
                    type: REQUEST_CONTRACTS_FAILURE
                })
            }
        }
    }
    catch(e) {console.log(`updateSelectedContractAnnotation() error - ${e}`)}
    
    return Promise.resolve(false);
}


/**
 * 
 * Upload document file and its meta data as a new filing doc
 * 
 * @param {*} file 
 * @param {*} meta_data 
 */
export const requestUploadContract = (file, meta_data) => async (dispatch, getState) => {

    try {
        dispatch({
            type: SET_CONTRACTS_LOADING, 
            loading: true
        });
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
                dispatch({
                    type: SET_CONTRACTS_LOADING, 
                    loading: false
                });
                return uploadContract(token, file, meta_data);
            } 
            catch (error) {}
        }
    
    }
    catch (e) {}

    dispatch({
        type: SET_CONTRACTS_LOADING, 
        loading: false
    });
    return Promise.resolve(false);

}

/**
 *  Delete a document with given id
 */
export const requestDeleteContract = (contract_id) => async (dispatch, getState) => {

    try {
        dispatch({
            type: SET_CONTRACTS_LOADING, 
            loading: true
        });
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await deleteContract(token, contract_id);
                console.log("Response from contracts api: ", response);
            
                if(response.status===200) {
                    dispatch({
                        type: SET_CONTRACTS_LOADING, 
                        loading: false
                    });
                    return Promise.resolve(true);
                }
            }    
            catch (error) {}
        }
    }
    catch(e) {}
   
    dispatch({
        type: SET_CONTRACTS_LOADING, 
        loading: false
    });
    return Promise.resolve(false);
    
}

/**
 * Delete multiple docs (pass in array of validdoc ids)
 */
export const requestDeleteMultipleContracts = (contract_ids) => async (dispatch, getState) => {
    
    try {
        dispatch({
            type: SET_CONTRACTS_LOADING, 
            loading: true
        });
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await deleteMultipleContracts(token, contract_ids);
                console.log("Response from contracts api: ", response);
            
                if(response.status===200) {
                    dispatch({
                        type: SET_CONTRACTS_LOADING, 
                        loading: false
                    });
                    return Promise.resolve(true);
                }
            }    
            catch (error) {}
        }
    }
    catch (e) {}
    
    dispatch({
        type: SET_CONTRACTS_LOADING, 
        loading: false
    });
    return Promise.resolve(false);
    
}

export const requestUpdateContract = (contract_json) => async (dispatch, getState) => {

    try {
        dispatch({
            type: SET_CONTRACTS_LOADING, 
            loading: true
        });
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await updateContractRequest(token, contract_json);
                console.log("Response from contracts api: ", response);
            
                if(response.status===200) {
                    dispatch({
                        type: SET_CONTRACTS_LOADING, 
                        loading: false
                    });
                    return Promise.resolve(true);
                }
            }    
            catch (error) {}
        }
    }
    catch(e) {}
   
    dispatch({
        type: SET_CONTRACTS_LOADING, 
        loading: false
    });
    return Promise.resolve(false);

}