import { 
  TRY_LOGIN,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGOUT
} from './constants';

export function auth(
  state = {
    user: null, 
    token: '',
    loading: false,
    error: false
  }, action) {
    switch (action.type) {
      case TRY_LOGIN:
        return Object.assign({}, state, {
          loading: true
        });
      case LOGIN_SUCCESS:
        return Object.assign({}, state, {
          loading:false,
          user: action.user,
          token: action.token
        });
      case LOGIN_FAILURE:
        return Object.assign({}, state, {
          loading:false,
          user: null,
          token: "",
          error: action.error
        });
      case LOGOUT:
        return state;
      default:
        return state;
    }
}