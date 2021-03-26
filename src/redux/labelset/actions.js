import {
    CLEAR_LABELSET,
    REQUEST_LABELSET,
    REQUEST_LABELSET_FAILURE,
    REQUEST_LABELSET_SUCCESS,
    SELECT_LABELSET,
    UNSELECT_LABELSET,
    OPEN_LABELSET,
    CLOSE_LABELSET,
    SET_LABELSET_PAGE,
    SET_LABELSET_SEARCH_FILTER,
    UPDATE_LABELSET,
} from './constants';

import { 
    REQUEST_LABELS_SUCCESS,
    REQUEST_LABELS,
    REQUEST_LABELS_FAILURE
} from '../labels/constants';

import {
    deleteLabelset,
    getLabelsets,
    getLabelsetLabels,
    getFullLabelset,
    createLabelset,
    updateLabelset as updateLabelsetCall,
    removeMultipleLabelsets,
    addLabelsToLabelset,
    removeLabelsToLabelset,
    createLabelAndAddToLabelset,
} from '../../api/LabelsetAPI';



export const clearLabelsets = () => async (dispatch) => {
    await dispatch({
      type: CLEAR_LABELSET
    });
    return Promise.resolve();
}

export const setLabelsetSearchTerm = (search_term) => async (dispatch) => {
    await dispatch({
      type: SET_LABELSET_SEARCH_FILTER,
      search_term
    });
    return Promise.resolve();
}

export const setLabelsetPage = (selected_page) => async (dispatch) => {
    await dispatch({
        type: SET_LABELSET_PAGE,
        selected_page
    });
    return Promise.resolve();
}

export const selectLabelset = (selected_item) => async (dispatch) => {
    await dispatch({
        type: SELECT_LABELSET,
        selected_items: [selected_item]
    });
    return Promise.resolve(true);
}

export const unselectLabelset = (unselected_item) => async (dispatch) => {
    await dispatch({
        type: UNSELECT_LABELSET,
        unselected_items: [unselected_item]
    });
    return Promise.resolve(true);
}

export const openLabelset = (opened_item) => async (dispatch) => {
    await dispatch({
        type: OPEN_LABELSET,
        opened_item
    });
    return Promise.resolve(true);
}

export const closeLabelset = () => async (dispatch) => {
    await dispatch({
        type: CLOSE_LABELSET,
    });
    return Promise.resolve(true);
}

export const updateLabelset = (label_obj) => async (dispatch) => {
    await dispatch({
        type: UPDATE_LABELSET, 
        label_obj
    });
    return Promise.resolve(true);
}

/**
 * Request a page of LABELsETS, applying whatever filters are currently in the 
 * redux state store. Corpus_id filter is optional.
 */
export const requestLabelsets = (corpus_id) => async (dispatch, getState) => {
    try {
        let { token } = getState().auth;
        let { selected_page, search_term } = getState().labels;
        
        await dispatch({ type: REQUEST_LABELSET});

        let response = await getLabelsets(token, selected_page, search_term, corpus_id);
        console.log("Response from labelset api: ", response);
        if(response.status===200) {
          await dispatch({
              type: REQUEST_LABELSET_SUCCESS,
              items: response.data.results,
              count: response.data.count, 
              page_size: response.data.page_size, 
              total_pages: response.data.total_pages
          });
          return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_LABELSET_FAILURE
            })
        }
    }
    catch (e) {
        console.log("Error fetching labelsets: ", e);
    }
    return Promise.resolve(false);
}

export const requestDeleteLabelset = (label_id) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await deleteLabelset(token, label_id);
                console.log("Response from label api: ", response);
    
                if(response.status===204) {
                    return Promise.resolve(true);
                }
            }    
            catch (error) {}
        }    
    }
    catch(e) {
        console.log("Error deleting label:", e);
    }
   
    return Promise.resolve(false);
    
}

export const requestLabelsetLabels = (labelset_id)  => async (dispatch, getState) => {
    
    try {
        let { token } = getState().auth;        
        await dispatch({ type: REQUEST_LABELS});

        let response = await getLabelsetLabels(token, labelset_id);
        console.log("Response from LABEL api: ", response);
        if(response.status===200) {
            await dispatch({
                type: REQUEST_LABELS_SUCCESS,
                items: response.data
            });
            return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_LABELS_FAILURE
            })
        }
    }
    catch(e) { console.log("Error getting labels for labelset", e) }
    
    return Promise.resolve(false);

}

export const requestRemoveMultipleLabelsets = (label_ids) => async (dispatch, getState) => {
    console.log("Delete label ids:", label_ids)
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await removeMultipleLabelsets(token, label_ids);
                console.log("Response from label api: ", response);
            
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

export const createLabelForLabelset = (label_set, label_json) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await createLabelAndAddToLabelset(token, label_set, label_json);
                console.log("Response from labelset api: ", response);
            
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

export const requestAddLabelsToLabelset = (label_set, label_ids) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await addLabelsToLabelset(token, label_set, label_ids);
                console.log("Response from labelset api: ", response);
            
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

export const requestRemoveLabelsToLabelset = (label_set, label_ids) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await removeLabelsToLabelset(token, label_set, label_ids);
                console.log("Response from labelset api: ", response);
            
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

export const requestCreateLabelset = (label_set_json) => async(dispatch, getState) => {
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
        
            let response = await createLabelset(token, label_set_json);
            console.log("Response from label_set api: ", response);
            if(response.status===200) {
              return Promise.resolve(true);
            }
            
        }   
    }
    catch(e) {}

    return Promise.resolve(false);
}

export const requestUpdateLabelset = (label_set_json) => async(dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            let response = await updateLabelsetCall(token, label_set_json);
            console.log("Response from label_set api: ", response);
            if(response.status===200) {
              return Promise.resolve(true);
            }
        }   
    }
    catch(e) {}

    return Promise.resolve(false);
}