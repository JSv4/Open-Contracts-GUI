
import axios from 'axios';

let {REACT_APP_PRODUCTION_API_URL, REACT_APP_DEVELOPMENT_API_URL} = process.env;

const API_URL = process.env.NODE_ENV === 'development' ? 
                  REACT_APP_DEVELOPMENT_API_URL :
                  REACT_APP_PRODUCTION_API_URL;

const dataAxios = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 10000,
});

export default dataAxios;