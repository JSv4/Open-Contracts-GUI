import { 
    CLEAR_CONTRACTS,
    REQUEST_CONTRACTS, 
    REQUEST_CONTRACTS_FAILURE,
    REQUEST_CONTRACTS_SUCCESS,
    SET_CONTRACT_PAGE,
    SET_CONTRACT_SEARCH_FILTER,
    SELECT_CONTRACTS,
    UNSELECT_CONTRACTS,
    CLEAR_SELECTED_CONTRACTS,
    UPDATE_CONTRACT,
    OPEN_CONTRACT,
    CLOSE_CONTRACT,
    SET_CONTRACTS_LOADING
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

export function contracts(
state = initial_state, action) {
    switch (action.type) {
    case REQUEST_CONTRACTS:
        return Object.assign({}, state, {
        loading: true
        });
    case SET_CONTRACTS_LOADING:
        return Object.assign({}, state, {
            loading: action.loading
        });
    case REQUEST_CONTRACTS_SUCCESS:
        return Object.assign({}, state, {
        loading:false,
        selected_items: [],
        items: action.items, 
        count: action.count, 
        page_size: action.page_size,
        total_pages: action.total_pages      
        });
    case REQUEST_CONTRACTS_FAILURE:
        return Object.assign({}, state, {
        loading:false,
        error: true, 
        });
    case SET_CONTRACT_SEARCH_FILTER:
        return Object.assign({}, state, {
        search_term: action.search_term
        });
    case SET_CONTRACT_PAGE:
        return Object.assign({}, state, {
        selected_page: action.selected_page,
        });
    case OPEN_CONTRACT: 
        return Object.assign({}, state, {
            opened_item: action.opened_item,
        });
    case CLOSE_CONTRACT:
        return Object.assign({}, state, {
            opened_item: null,
        });
    case CLEAR_SELECTED_CONTRACTS: 
        return Object.assign({}, state, {
            selected_items: []
        });
    case SELECT_CONTRACTS:
        return Object.assign({}, state, {
            selected_items: [...state.selected_items, ...action.selected_items]
        });
    case UNSELECT_CONTRACTS:
        return Object.assign({}, state, {
            selected_items: _.difference([...state.selected_items], action.unselected_items),
        });
    case UPDATE_CONTRACT: 
        let old_item = state.items.filter(item => item.id === action.item.id);
        let new_item = {...old_item, ...action.contract_obj};
        let new_items = state.items.filter(item => item.id !== action.contract_obj.id);
        return Object.assign({}, state, {
            items: [...new_items, new_item]     
        });
    case CLEAR_CONTRACTS:
        return initial_state;
    default:
        return state;
    }
}
  