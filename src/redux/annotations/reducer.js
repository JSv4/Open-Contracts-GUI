import { 
    CLEAR_ANNOTATIONS,
    REQUEST_ANNOTATIONS, 
    REQUEST_ANNOTATIONS_FAILURE,
    REQUEST_ANNOTATIONS_SUCCESS,
    SET_ANNOTATION_PAGE,
    SET_ANNOTATION_SEARCH_FILTER,
    SELECT_ANNOTATION,
    UNSELECT_ANNOTATION,
    OPEN_ANNOTATION,
    CLOSE_ANNOTATION,
    UPDATE_ANNOTATION,
    ADD_ANNOTATION,
    REMOVE_ANNOTATION
} from './constants';

import _ from 'lodash';
  
const initial_state = {
    items:[],
    opened_item: null,
    selected_item: null,
    selected_page: 1,
    count: 1,
    page_size: 10,
    total_pages: 10,
    search_term: "",
    loading: false,
    error: false
};

export function annotations(
state = initial_state, action) {
    switch (action.type) {
    case REQUEST_ANNOTATIONS:
        return Object.assign({}, state, {
        loading: true
        });
    case REQUEST_ANNOTATIONS_SUCCESS:
        return Object.assign({}, state, {
        loading:false,
        selected_item: null,
        items: action.items, 
        count: action.count, 
        page_size: action.page_size,
        total_pages: action.total_pages      
        });
    case UPDATE_ANNOTATION:
        let old_item = state.items.filter(item => item.id === action.item.id);
        let new_item = {...old_item, ...action.item};
        let new_items = state.items.filter(item => item.id !== action.id);
        return Object.assign({}, state, {
            items: [...new_items, new_item]     
        });
    case REQUEST_ANNOTATIONS_FAILURE:
        return Object.assign({}, state, {
        loading:false,
        error: true, 
        });
    case SET_ANNOTATION_SEARCH_FILTER:
        return Object.assign({}, state, {
        search_term: action.search_term
        });
    case SET_ANNOTATION_PAGE:
        return Object.assign({}, state, {
        selected_page: action.selected_page,
        });
    case OPEN_ANNOTATION:
        return Object.assign({}, state, {
            opened_item: action.opened_item,
        });
    case CLOSE_ANNOTATION:
        return Object.assign({}, state, {
            opened_item: null,
        });
    case SELECT_ANNOTATION:
        return Object.assign({}, state, {
            selected_item: action.selected_item,
        });
    case UNSELECT_ANNOTATION:
        return Object.assign({}, state, {
            selected_item: null,
        });
    case ADD_ANNOTATION:
        return Object.assign({}, state, {
            items: [...state.items, action.annotation_json],
        });
    case REMOVE_ANNOTATION:
        let new_annotations = [...state.items]; 
        _.remove(new_annotations, {id: action.annotation_id})
        return Object.assign({}, state, {
            items: new_annotations,
        });
    case CLEAR_ANNOTATIONS:
        return initial_state;
    default:
        return state;
    }
}
  