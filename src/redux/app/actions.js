import { toast } from 'react-toastify';

export const showSuccessToast = (message) => async (dispatch, getState) => {
    toast.success(message, {
      position: toast.POSITION.TOP_CENTER
    });
  }
  
  export const showErrorToast = (message) => async (dispatch, getState) => {
    toast.error(message, {
      position: toast.POSITION.TOP_CENTER
    });
  }
