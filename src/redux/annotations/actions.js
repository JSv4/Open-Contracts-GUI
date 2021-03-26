import {
    ADD_ANNOTATION,
    CLEAR_ANNOTATIONS,
    CLOSE_ANNOTATION,
    OPEN_ANNOTATION,
    REMOVE_ANNOTATION,
    REQUEST_ANNOTATIONS,
    REQUEST_ANNOTATIONS_FAILURE,
    REQUEST_ANNOTATIONS_SUCCESS,
    SELECT_ANNOTATION,
    SET_ANNOTATION_PAGE,
    SET_ANNOTATION_SEARCH_FILTER,
    UNSELECT_ANNOTATION,
    UPDATE_ANNOTATION
} from './constants';

import {
    getAnnotations,
    getAnnotationData,
    createAnnotation,
    deleteAnnotation
} from '../../api/AnnotationAPI';
import { getCorpusAnnotations } from '../../api/ContractsAPI';


export const removeAnnotation = (annotation_id) => async (dispatch) => {
    await dispatch({
        type: REMOVE_ANNOTATION,
        annotation_id
      });
      return Promise.resolve(true);
}

export const openAnnotation = (annotation_id) => async (dispatch) => {
    dispatch({
        type: OPEN_ANNOTATION,
        opened_item: annotation_id
    });
    return Promise.resolve(true)
}

export const closeAnnotation = () => async (dispatch) => {
    dispatch({
        type: CLOSE_ANNOTATION,
    });
    return Promise.resolve(true)
}

export const addAnnotation = (annotation_json) => async (dispatch) => {
    await dispatch({
        type: ADD_ANNOTATION,
        annotation_json
      });
      return Promise.resolve(true);
}

export const clearAnnotations = () => async (dispatch) => {
    await dispatch({
      type: CLEAR_ANNOTATIONS
    });
    return Promise.resolve();
}

export const setAnnotationSearchTerm = (search_term) => async (dispatch) => {
    await dispatch({
      type: SET_ANNOTATION_SEARCH_FILTER,
      search_term
    });
    return Promise.resolve();
}

export const setAnnotationPage = (selected_page) => async (dispatch) => {
    await dispatch({
        type: SET_ANNOTATION_PAGE,
        selected_page
    });
    return Promise.resolve();
}

export const selectAnnotation = (selected_item) => async (dispatch) => {
    await dispatch({
        type: SELECT_ANNOTATION,
        selected_item
    });
    return Promise.resolve();
}

export const unselectAnnotation = () => async (dispatch) => {
    await dispatch({
        type: UNSELECT_ANNOTATION,
    });
    return Promise.resolve();
}

export const requestDeleteAnnotation = (annotation_id) => async(dispatch, getState) => {
    console.log("requestDeleteAnnotation", annotation_id);
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
            let response = await deleteAnnotation(token, annotation_id);

            console.log("Response from Annotations api: ", response);

            if(response.status===204) {
                await dispatch({
                    type: REMOVE_ANNOTATION,
                    annotation_id
                });
                return Promise.resolve(true);
            }
        }
    }
    catch (e) {
        console.log("requestCreateAnnotation - failed with error", e);
    }
    return Promise.resolve(false);
}

export const requestCreateAnnotation = (annotation_json) => async (dispatch, getState) => {
    try {
            if (getState().auth.token) {

            let { token } = getState().auth;
            let response = await createAnnotation(token, annotation_json);

            console.log("Response from Annotations api: ", response);

            if(response.status===201) {
                await dispatch({
                    type: ADD_ANNOTATION,
                    annotation_json: response.data
                });
                return Promise.resolve(true);
            }
        }
    }
    catch (e) {
        console.log("requestCreateAnnotation - failed with error", e);
    }
    return Promise.resolve(false);
}

export const requestCorpusAnnotations = (corpus_id="", label_id="") => async (dispatch, getState) => {
    try {

        let { token } = getState().auth;
        let { selected_page, search_term } = getState().annotations;
        
        await dispatch({ type: REQUEST_ANNOTATIONS});

        let response = await getCorpusAnnotations(token, corpus_id, search_term, label_id, selected_page);
        console.log("Response from Annotations api: ", response);
        if(response.status===200) {
          await dispatch({
              type: REQUEST_ANNOTATIONS_SUCCESS,
              items: response.data.results,
              count: response.data.count, 
              page_size: response.data.page_size, 
              total_pages: response.data.total_pages
          });
          return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_ANNOTATIONS_FAILURE
            })
        }
    }
    catch(e) {
        console.log("Error fetching annotations: ", e);
    }
    return Promise.resolve(false);
}

/**
 * Request a page of Annotations, applying whatever filters are currently in the 
 * redux state store.
 */
export const requestAnnotations = () => async (dispatch, getState) => {
    try {

        let { token } = getState().auth;
        let { selected_page, search_term } = getState().annotations;
        
        await dispatch({ type: REQUEST_ANNOTATIONS});

        let response = await getAnnotations(token, selected_page, search_term);
        console.log("Response from Annotations api: ", response);
        if(response.status===200) {
          await dispatch({
              type: REQUEST_ANNOTATIONS_SUCCESS,
              items: response.data.results,
              count: response.data.count, 
              page_size: response.data.page_size, 
              total_pages: response.data.total_pages
          });
          return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_ANNOTATIONS_FAILURE
            })
        }
    }
    catch(e) {
        console.log("Error fetching annotations: ", e);
    }
    return Promise.resolve(false);
}

/**
 * Request full data of an annotation by id. Then merge the new data into the redux store's
 * existing obj.
 */
export const requestAnnotationData = (contract_id, corpus_id="") => async (dispatch, getState) => {
    if (getState().auth.token) {

        let { token } = getState().auth;
        
        await dispatch({ type: REQUEST_ANNOTATIONS});

        let response = await getAnnotationData(token, contract_id, corpus_id);
        console.log("Response from Annotations api: ", response);
        if(response.status===200) {
          await dispatch({
              type: UPDATE_ANNOTATION,
              item: response.data,
          });
          return Promise.resolve(true);
        }
        else {
            await dispatch({
                type: REQUEST_ANNOTATIONS_FAILURE
            })
        }
    }
    return Promise.resolve(false);
}