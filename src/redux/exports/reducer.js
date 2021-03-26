import { 
    CLEAR_EXPORTS,
    REQUEST_EXPORTS, 
    REQUEST_EXPORTS_FAILURE,
    REQUEST_EXPORTS_SUCCESS,
    SET_EXPORT_PAGE,
    SET_EXPORT_SEARCH_FILTER,
    SELECT_EXPORT,
    UNSELECT_EXPORT,
    REMOVE_EXPORT
} from './constants';

import _ from 'lodash';
  
const initial_state = {
    items:[],
    selected_item: null,
    selected_page: 1,
    count: 1,
    page_size: 10,
    total_pages: 10,
    search_term: "",
    loading: false,
    error: false
};

export function exports(
state = initial_state, action) {
    switch (action.type) {
    case REQUEST_EXPORTS:
        return Object.assign({}, state, {
            loading: true
        });
    case REQUEST_EXPORTS_SUCCESS:
        return Object.assign({}, state, {
            loading:false,
            selected_item: null,
            items: action.items, 
            count: action.count, 
            page_size: action.page_size,
            total_pages: action.total_pages      
        });
    case REQUEST_EXPORTS_FAILURE:
        return Object.assign({}, state, {
        loading:false,
        error: true, 
        });
    case SET_EXPORT_SEARCH_FILTER:
        return Object.assign({}, state, {
        search_term: action.search_term
        });
    case SET_EXPORT_PAGE:
        return Object.assign({}, state, {
        selected_page: action.selected_page,
        });
    case SELECT_EXPORT:
        return Object.assign({}, state, {
            selected_item: action.selected_item,
        });
    case UNSELECT_EXPORT:
        return Object.assign({}, state, {
            selected_item: null,
        });
    case REMOVE_EXPORT:
        let new_relations = [...state.items]; 
        _.remove(new_relations, {id: action.relation_id})
        return Object.assign({}, state, {
            items: new_relations,
        });
    case CLEAR_EXPORTS:
        return initial_state;
    default:
        return state;
    }
}
  