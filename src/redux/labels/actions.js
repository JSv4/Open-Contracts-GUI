import {
    CLEAR_LABELS,
    REQUEST_LABELS,
    REQUEST_LABELS_FAILURE,
    REQUEST_LABELS_SUCCESS,
    SELECT_LABELS,
    UNSELECT_LABELS,
    CLEAR_SELECTED_LABELS,
    OPEN_LABEL,
    CLOSE_LABEL,
    SET_LABEL_PAGE,
    SET_LABEL_SEARCH_FILTER,
    UPDATE_LABEL,
    REMOVE_LABEL,
    ADD_LABEL,
} from './constants';

import {
    deleteLabel,
    getLabels,
    createLabel, 
    updateLabel as updateLabelCall,
    deleteMultipleLabels
} from '../../api/LabelsAPI';

export const removeLabel = (label_id) => async (dispatch) => {
    await dispatch({
        type: REMOVE_LABEL,
        label_id
      });
      return Promise.resolve(true);
}

export const addLabel = (label_json) => async (dispatch) => {
    await dispatch({
        type: ADD_LABEL,
        label_json
      });
      return Promise.resolve(true);
}

export const clearLabels = () => async (dispatch) => {
    await dispatch({
      type: CLEAR_LABELS
    });
    return Promise.resolve(true);
}

export const setLabelSearchTerm = (search_term) => async (dispatch) => {
    await dispatch({
      type: SET_LABEL_SEARCH_FILTER,
      search_term
    });
    return Promise.resolve(true);
}

export const setLabelPage = (selected_page) => async (dispatch) => {
    await dispatch({
        type: SET_LABEL_PAGE,
        selected_page
    });
    return Promise.resolve(true);
}

export const selectLabel = (selected_item) => async (dispatch) => {
    await dispatch({
        type: SELECT_LABELS,
        selected_items: [selected_item]
    });
    return Promise.resolve(true);
}

export const unselectLabel = (unselected_item) => async (dispatch) => {
    await dispatch({
        type: UNSELECT_LABELS,
        unselected_items: [unselected_item]
    });
    return Promise.resolve(true);
}

export const clearSelectedLabels = () => async (dispatch) => {
    await dispatch({
        type: CLEAR_SELECTED_LABELS,
    });
    return Promise.resolve(true);
}

export const openLabel = (opened_item) => async (dispatch) => {
    await dispatch({
        type: OPEN_LABEL,
        opened_item
    });
    return Promise.resolve(true);
}

export const closeLabel = () => async (dispatch) => {
    await dispatch({
        type: CLOSE_LABEL,
    });
    return Promise.resolve(true);
}

export const updateLabel = (updated_obj) => async (dispatch) => {
    await dispatch({
        type: UPDATE_LABEL, 
        updated_obj
    });
    return Promise.resolve(true);
}

/**
 * Request a page of LABELs, applying whatever filters are currently in the 
 * redux state store. Corpus_id filter is optional.
 */
export const requestLabelSetLabels = (labelset_id) => async (dispatch, getState) => {
    try {
        let { token } = getState().auth;
        let { selected_page, search_term } = getState().labels;
        
        await dispatch({ type: REQUEST_LABELS});

        let response = await getLabels(token, selected_page, search_term, labelset_id);
        console.log("Response from LABEL api: ", response);
        if(response.status===200) {
          await dispatch({
              type: REQUEST_LABELS_SUCCESS,
              items: response.data.results,
              count: response.data.count, 
              page_size: response.data.page_size, 
              total_pages: response.data.total_pages
          });
          return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_LABELS_FAILURE
            })
        }
    }
    catch(e) {
        console.log("Error requesting labels for labelset: ", e);
    }  
    return Promise.resolve(false);
}

export const requestDeleteLabel = (label_id) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await deleteLabel(token, label_id);
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

export const requestDeleteMultipleLabels = (label_ids) => async (dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            try {
            
                let response = await deleteMultipleLabels(token, label_ids);
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

export const requestCreateLabel = (label_json) => async(dispatch, getState) => {
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
        
            let response = await createLabel(token, label_json);
            console.log("Response from label_set api: ", response);
            if(response.status===200) {
              return Promise.resolve(true);
            }
        }   
    }
    catch(e) {}

    return Promise.resolve(false);
}

export const requestUpdateLabel = (label_json) => async(dispatch, getState) => {
    try {
        if (getState().auth.token) {
            let { token } = getState().auth;
            let response = await updateLabelCall(token, label_json);
            console.log("Response from label_set api: ", response);
            if(response.status===200) {
                dispatch(updateLabel(label_json));
                return Promise.resolve(true);

            }
        }   
    }
    catch(e) {
        console.log("Unable to update label", e);
    }

    return Promise.resolve(false);
}

export const addLabelsToLabelset = (label_ids) => {}