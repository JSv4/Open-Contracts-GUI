import { 
    CLEAR_CORPUSES,
    REQUEST_CORPUSES, 
    REQUEST_CORPUSES_FAILURE,
    REQUEST_CORPUSES_SUCCESS,
    SET_CORPUS_PAGE,
    SET_CORPUS_SEARCH_FILTER,
    SELECT_CORPUS,
    UNSELECT_CORPUS
} from './constants';
  
const initial_state = {
    items:[],
    selected_item: null,
    selected_page: 1,
    count: 1,
    page_size: 10,
    total_pages: 10,
    search_term: "",
    label_set:{},
    loading: false,
    error: false
};

export function corpuses(
state = initial_state, action) {
    switch (action.type) {
    case REQUEST_CORPUSES:
        return Object.assign({}, state, {
        loading: true
        });
    case REQUEST_CORPUSES_SUCCESS:
        return Object.assign({}, state, {
        loading:false,
        selected_item: null,
        items: action.items, 
        count: action.count, 
        page_size: action.page_size,
        total_pages: action.total_pages      
        });
    case REQUEST_CORPUSES_FAILURE:
        return Object.assign({}, state, {
        loading:false,
        error: true, 
        });
    case SET_CORPUS_SEARCH_FILTER:
        return Object.assign({}, state, {
        search_term: action.search_term
        });
    case SET_CORPUS_PAGE:
        return Object.assign({}, state, {
        selected_page: action.selected_page,
        });
    case SELECT_CORPUS:
        console.log("select corpus...");
        return Object.assign({}, state, {
            selected_item: action.selected_item,
        });
    case UNSELECT_CORPUS:
        return Object.assign({}, state, {
            selected_item: null,
        });
    case CLEAR_CORPUSES:
        return initial_state;
    default:
        return state;
    }
}
  