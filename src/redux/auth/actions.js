
import {TRY_LOGIN, LOGIN_FAILURE, LOGIN_SUCCESS, LOGOUT} from './constants'

export const handleLogout = () => async (dispatch) => {
  return dispatch({
    type: LOGOUT,
  });
}

export const receiveUser = () => async (dispatch) => {
  return dispatch({
    type: TRY_LOGIN,
  });
}

export const handleLoginSuccess = ({user, token}) => async (dispatch) => {
  return dispatch({
    type: LOGIN_SUCCESS,
    token,
    user
  });
}

export const handleLoginFailure = (response) => async (dispatch) => {
  return dispatch({
    type: LOGIN_FAILURE
  });
}
