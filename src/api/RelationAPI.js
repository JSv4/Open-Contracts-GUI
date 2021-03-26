import dataAxios from './http';
import _ from 'lodash';

//########################## LABELS API CALLS ##########################
export const deleteRelation = async (token, relation_id) => {
    return dataAxios.delete(`/relations/${relation_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}

export const deleteMultipleRelations = async (token, relation_ids) => {
    return dataAxios.delete(`/relations/bulk_delete/`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: { relation_ids },
            timeout: 30000
        });
}

export const createRelation = async (token, relation_json) => {
    
    return dataAxios.post(`/relations/`, relation_json, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000,
    });

}