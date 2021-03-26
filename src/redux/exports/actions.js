import {
    CLEAR_EXPORTS,
    REMOVE_EXPORT,
    REQUEST_EXPORTS,
    REQUEST_EXPORTS_FAILURE,
    REQUEST_EXPORTS_SUCCESS,
    SELECT_EXPORT,
    SET_EXPORT_PAGE,
    SET_EXPORT_SEARCH_FILTER,
    UNSELECT_EXPORT,
} from './constants';

import {
    deleteExport,
    getExports
} from '../../api/ExportAPI';

export const clearExports = () => async (dispatch) => {
    await dispatch({
      type: CLEAR_EXPORTS
    });
    return Promise.resolve();
}

export const setExportSearchTerm = (search_term) => async (dispatch) => {
    await dispatch({
      type: SET_EXPORT_SEARCH_FILTER,
      search_term
    });
    return Promise.resolve();
}

export const setExportPage = (selected_page) => async (dispatch) => {
    await dispatch({
        type: SET_EXPORT_PAGE,
        selected_page
    });
    return Promise.resolve();
}

export const selectExport = (selected_item) => async (dispatch) => {
    await dispatch({
        type: SELECT_EXPORT,
        selected_item
    });
    return Promise.resolve();
}

export const unselectExport = () => async (dispatch) => {
    await dispatch({
        type: UNSELECT_EXPORT,
    });
    return Promise.resolve();
}

export const requestExports = () => async(dispatch, getState) => {
    console.log("requestExports");
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
            let { selected_page, search_term } = getState().exports;
            
            await dispatch({ type: REQUEST_EXPORTS});

            let response = await getExports(token, selected_page, search_term);
            console.log("Response from exports api: ", response);
            if(response.status===200) {
                await dispatch({
                    type: REQUEST_EXPORTS_SUCCESS,
                    items: response.data.results,
                    count: response.data.count, 
                    page_size: response.data.page_size, 
                    total_pages: response.data.total_pages
                });
                return Promise.resolve(true);
            }
            else {
                await dispatch({
                    type: REQUEST_EXPORTS_FAILURE
                })
            }
        }
    }
    catch (e) {
        console.log("requestCreateExport - failed with error", e);
    }
    return Promise.resolve(false);
}

export const requestDeleteExport = (export_id) => async(dispatch, getState) => {
    console.log("requestDeleteExport", export_id);
    try {
        if (getState().auth.token) {

            let { token } = getState().auth;
            let response = await deleteExport(token, export_id);

            console.log("Response from Exports api: ", response);

            if(response.status===204) {
                await dispatch({
                    type: REMOVE_EXPORT,
                    relation_id: export_id
                });
                Promise.resolve(true);
            }
        }
    }
    catch (e) {
        console.log("requestCreateExport - failed with error", e);
    }
    return Promise.resolve(false);
}


