import { 
    CLEAR_LABELSET,
    REQUEST_LABELSET, 
    REQUEST_LABELSET_FAILURE,
    REQUEST_LABELSET_SUCCESS,
    SET_LABELSET_PAGE,
    SET_LABELSET_SEARCH_FILTER,
    UPDATE_LABELSET,
    SELECT_LABELSET,
    UNSELECT_LABELSET,
    OPEN_LABELSET,
    CLOSE_LABELSET
} from './constants';

import _ from 'lodash';
  
const initial_state = {
    items:[],
    selected_items: [],
    opened_item: null,
    selected_page: 1,
    count: 1,
    page_size: 10,
    total_pages: 10,
    search_term: "",
    loading: false,
    error: false
};

export function labelsets(
state = initial_state, action) {
    switch (action.type) {
    case REQUEST_LABELSET:
        return Object.assign({}, state, {
        loading: true
        });
    case REQUEST_LABELSET_SUCCESS:
        return Object.assign({}, state, {
        loading:false,
        selected_item: null,
        items: action.items, 
        count: action.count, 
        page_size: action.page_size,
        total_pages: action.total_pages      
        });
    case REQUEST_LABELSET_FAILURE:
        return Object.assign({}, state, {
        loading:false,
        error: true, 
        });
    case UPDATE_LABELSET: 
        let items = [...state.items];
        let index = _.findIndex(items, {id: action.updated_obj.id});
        items.splice(index, 1, action.updated_obj);
        return Object.assign({}, state, {
            items 
        });
    case SET_LABELSET_SEARCH_FILTER:
        return Object.assign({}, state, {
        search_term: action.search_term
        });
    case SET_LABELSET_PAGE:
        return Object.assign({}, state, {
        selected_page: action.selected_page,
        });
    case OPEN_LABELSET: 
        return Object.assign({}, state, {
            opened_item: action.opened_item,
        });
    case CLOSE_LABELSET:
        return Object.assign({}, state, {
            opened_item: null,
        });
    case SELECT_LABELSET:
        return Object.assign({}, state, {
            selected_items: [...state.selected_items, ...action.selected_items]
        });
    case UNSELECT_LABELSET:
        return Object.assign({}, state, {
            selected_items: _.difference([...state.selected_items], action.unselected_items),
        });
    case CLEAR_LABELSET:
        return initial_state;
    default:
        return state;
    }
}
  