import { 
    CLEAR_LABELS,
    REQUEST_LABELS, 
    REQUEST_LABELS_FAILURE,
    REQUEST_LABELS_SUCCESS,
    SET_LABEL_PAGE,
    SET_LABEL_SEARCH_FILTER,
    UPDATE_LABEL,
    SELECT_LABELS,
    UNSELECT_LABELS,
    ADD_LABEL,
    REMOVE_LABEL,
    CLEAR_SELECTED_LABELS,
    OPEN_LABEL,
    CLOSE_LABEL
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

export function labels(
state = initial_state, action) {
    switch (action.type) {
    case REQUEST_LABELS:
        return Object.assign({}, state, {
        loading: true
        });
    case REQUEST_LABELS_SUCCESS:
        return Object.assign({}, state, {
        loading:false,
        selected_item: null,
        items: action.items, 
        count: action.count, 
        page_size: action.page_size,
        total_pages: action.total_pages      
        });
    case REQUEST_LABELS_FAILURE:
        return Object.assign({}, state, {
        loading:false,
        error: true, 
        });
    case UPDATE_LABEL: 
        let items = [...state.items];
        let index = _.findIndex(items, {id: action.updated_obj.id});
        items.splice(index, 1, action.updated_obj);
        return Object.assign({}, state, {
            items 
        });
    case SET_LABEL_SEARCH_FILTER:
        return Object.assign({}, state, {
        search_term: action.search_term
        });
    case SET_LABEL_PAGE:
        return Object.assign({}, state, {
        selected_page: action.selected_page,
        });
    case OPEN_LABEL: 
        return Object.assign({}, state, {
            opened_item: action.opened_item,
        });
    case CLOSE_LABEL:
        return Object.assign({}, state, {
            opened_item: null,
        });
    case ADD_LABEL:
        return Object.assign({}, state, {
            items: [...state.items, action.label_json],
        });
    case REMOVE_LABEL:
        let new_items = [...state.items];
        _.remove(new_items, {id: action.label_id});
        return Object.assign({}, state, {
            items: new_items,
        });
    case SELECT_LABELS:
        return Object.assign({}, state, {
            selected_items: [...state.selected_items, ...action.selected_items]
        });
    case UNSELECT_LABELS:
        return Object.assign({}, state, {
            selected_items: _.difference([...state.selected_items], action.unselected_items),
        });
    case CLEAR_SELECTED_LABELS:
        return Object.assign({}, state, {
            selected_items: [],
        });
    case CLEAR_LABELS:
        return initial_state;
    default:
        return state;
    }
}
  