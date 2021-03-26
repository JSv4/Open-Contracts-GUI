import {
    ADD_RELATION,
    CLEAR_RELATIONS,
    REMOVE_RELATION,
    REQUEST_RELATIONS,
    REQUEST_RELATIONS_FAILURE,
    REQUEST_RELATIONS_SUCCESS,
    SELECT_RELATION,
    SET_RELATION_PAGE,
    SET_RELATION_SEARCH_FILTER,
    UNSELECT_RELATION,
    UPDATE_RELATION
} from './constants';

import {
    createRelation,
    deleteRelation
} from '../../api/RelationAPI';


export const removeRelation = (relation_id) => async (dispatch) => {
    await dispatch({
        type: REMOVE_RELATION,
        relation_id
    });
    return Promise.resolve(true);
}

export const addRelation = (relation_json) => async (dispatch) => {
    await dispatch({
        type: ADD_RELATION,
        relation_json
      });
      return Promise.resolve(true);
}

export const clearRelations = () => async (dispatch) => {
    await dispatch({
      type: CLEAR_RELATIONS
    });
    return Promise.resolve();
}

export const setRelationSearchTerm = (search_term) => async (dispatch) => {
    await dispatch({
      type: SET_RELATION_SEARCH_FILTER,
      search_term
    });
    return Promise.resolve();
}

export const setRelationPage = (selected_page) => async (dispatch) => {
    await dispatch({
        type: SET_RELATION_PAGE,
        selected_page
    });
    return Promise.resolve();
}

export const selectRelation = (selected_item) => async (dispatch) => {
    await dispatch({
        type: SELECT_RELATION,
        selected_item
    });
    return Promise.resolve();
}

export const unselectRelation = () => async (dispatch) => {
    await dispatch({
        type: UNSELECT_RELATION,
    });
    return Promise.resolve();
}

export const requestDeleteRelation = (relation_id) => async(dispatch, getState) => {
    console.log("requestDeleteRelation", relation_id);
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
            let response = await deleteRelation(token, relation_id);

            console.log("Response from Relations api: ", response);

            if(response.status===204) {
                await dispatch({
                    type: REMOVE_RELATION,
                    relation_id
                });
                return true;
            }
        }
    }
    catch (e) {
        console.log("requestCreateRelation - failed with error", e);
    }
return false;
}

export const requestCreateRelation = (relation_json) => async (dispatch, getState) => {
    try {
            if (getState().auth.token) {

            let { token } = getState().auth;
            let response = await createRelation(token, relation_json);

            console.log("Response from Relations api: ", response);

            if(response.status===201) {
                await dispatch({
                    type: ADD_RELATION,
                    relation_json: response.data
                });
                return true;
            }
        }
    }
    catch (e) {
        console.log("requestCreateRelation - failed with error", e);
    }
    return false;
}
