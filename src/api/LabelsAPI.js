import dataAxios from './http';
import _ from 'lodash';

//########################## LABELS API CALLS ##########################
export const getLabels = async (token, selected_page = 1, search_term = "", labelset_id="") => {
    return dataAxios.get(`/labels/?page=${selected_page}&text_search=${search_term}&labelset=${labelset_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}

export const searchLabels = async (token, selected_page=1, search_term="") => {
    return dataAxios.get(`/labels/?page=${selected_page}&text_search=${search_term}`, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}

export const deleteLabel = async (token, label_id) => {
    return dataAxios.delete(`/labels/${label_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}

export const deleteMultipleLabels = async (token, label_ids) => {
    return dataAxios.delete(`/labels/bulk_delete/`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: { label_ids },
            timeout: 30000
        });
}

export const createLabel = async (token, label_json) => {
    
    let submission_json = {...label_json}
    const data = new FormData();

    if (submission_json.hasOwnProperty("shared_with") && _.isArray(submission_json["shared_with"]) && _.every(submission_json["shared_with"], _.isObject)  ) {
        data.append('shared_with', JSON.stringify(submission_json["shared_with"]));
        delete submission_json["shared_with"];
    }

    for (var key in submission_json) {
        if (submission_json.hasOwnProperty(key)) {
            data.append(key, submission_json[key]);
        }
    }

    return dataAxios.post(`/labels/`, data, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000,
    });

}

export const updateLabel = async (token, label_json) => {
    
    console.log("updateLabel", label_json);
    let submission_json = {...label_json}
    const data = new FormData();

    if (submission_json.hasOwnProperty("shared_with") && _.isArray(submission_json["shared_with"]) && _.every(submission_json["shared_with"], _.isObject)  ) {
        data.append('shared_with', JSON.stringify(submission_json["shared_with"]));
        delete submission_json["shared_with"];
    }

    for (var key in submission_json) {
        if (submission_json.hasOwnProperty(key)) {
            data.append(key, submission_json[key]);
        }
    }

    return dataAxios.patch(`/labels/${label_json.id}/`, data, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000,
    });
}