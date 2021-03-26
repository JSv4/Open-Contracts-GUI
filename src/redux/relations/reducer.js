import { 
    CLEAR_RELATIONS,
    REQUEST_RELATIONS, 
    REQUEST_RELATIONS_FAILURE,
    REQUEST_RELATIONS_SUCCESS,
    SET_RELATION_PAGE,
    SET_RELATION_SEARCH_FILTER,
    SELECT_RELATION,
    UNSELECT_RELATION,
    UPDATE_RELATION,
    ADD_RELATION,
    REMOVE_RELATION
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

export function relations(
state = initial_state, action) {
    switch (action.type) {
    case REQUEST_RELATIONS:
        return Object.assign({}, state, {
        loading: true
        });
    case REQUEST_RELATIONS_SUCCESS:
        return Object.assign({}, state, {
        loading:false,
        selected_item: null,
        items: action.items, 
        count: action.count, 
        page_size: action.page_size,
        total_pages: action.total_pages      
        });
    case UPDATE_RELATION:
        let old_item = state.items.filter(item => item.id === action.item.id);
        let new_item = {...old_item, ...action.item};
        let new_items = state.items.filter(item => item.id !== action.id);
        return Object.assign({}, state, {
            items: [...new_items, new_item]     
        });
    case REQUEST_RELATIONS_FAILURE:
        return Object.assign({}, state, {
        loading:false,
        error: true, 
        });
    case SET_RELATION_SEARCH_FILTER:
        return Object.assign({}, state, {
        search_term: action.search_term
        });
    case SET_RELATION_PAGE:
        return Object.assign({}, state, {
        selected_page: action.selected_page,
        });
    case SELECT_RELATION:
        return Object.assign({}, state, {
            selected_item: action.selected_item,
        });
    case UNSELECT_RELATION:
        return Object.assign({}, state, {
            selected_item: null,
        });
    case ADD_RELATION:
        return Object.assign({}, state, {
            items: [...state.items, action.relation_json],
        });
    case REMOVE_RELATION:
        let new_relations = [...state.items]; 
        _.remove(new_relations, {id: action.relation_id})
        return Object.assign({}, state, {
            items: new_relations,
        });
    case CLEAR_RELATIONS:
        return initial_state;
    default:
        return state;
    }
}
  