import dataAxios from './http';

//########################## USERS API CALLS ##########################
export const getUserList = async (token, selected_page=1, search_term="") => {
    return dataAxios.get(`/search_users/?page=${selected_page}&text_search=${search_term}`, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}
