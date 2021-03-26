
import dataAxios from './http';

export const getExports = async (token, selected_page, search_term) => {
    return dataAxios.get(`/exports/?page=${selected_page}&text_search=${search_term ? search_term : ""}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}

export const deleteExport = async (token, export_id) => {
    return dataAxios.delete(`/exports/${export_id}`, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}