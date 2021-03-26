import dataAxios from './http';
import { dataURLtoBlob } from '../utils/helperFunctions';
import validDataUrl from 'valid-data-url';
import _ from 'lodash';

//########################## LABEL SET API CALLS ##########################

export const getLabelsets = async (token, selected_page=1, search_term="", corpus_id="") => {
    return dataAxios.get(`/labelsets/?page=${selected_page}&text_search=${search_term}&corpus=${corpus_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
  }

export const getLabelsetLabels = async (token, label_set_id) => {
  return dataAxios.get(`/labelsets/${label_set_id}/get_labels/`, {
    headers: {
    'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

// Gets the actual data for a given label
export const getFullLabelset = async (token, label_set_id) => {
  return dataAxios.get(`/labelsets/${label_set_id}/get_data/`, {
      headers: {
      'Authorization': `Bearer ${token}`
      },
      timeout: 30000
  });
}

//Create a label set
export const createLabelset = async (token, label_json) => {
  
  const {
    title,
    description,
    is_public,
    shared_with,
    icon
  } = label_json;

  const data = new FormData();

  if (label_json.hasOwnProperty('public')) {
    data.append('public', label_json['public']);
  }

  if (icon) {
    data.append('icon', dataURLtoBlob(icon));
  }

  data.append('is_public', is_public);
  data.append('title', title);
  data.append('description', description);

  // This should be an array of objects mapping user to permission
  if (shared_with && _.isArray(shared_with) && _.every(shared_with, _.isObject)  ) {
    data.append('shared_with', JSON.stringify(shared_with));
  }

  return dataAxios.post(`/labelsets/`, data, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000,
  });

};

export const deleteLabelset = async (token, label_id) => {
  console.log("Delete label", label_id);
  return dataAxios.delete(`/labelsets/${label_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const removeMultipleLabelsets = async (token, labelset_ids) => {
  return dataAxios.delete(`/labelsets/bulk_delete/`, 
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    data: { labelset_ids },
    timeout: 30000
  });
}

export const createLabelAndAddToLabelset = async (token, labelset_id, label_json) => {
  return dataAxios.post(`/labelsets/${labelset_id}/create_label_and_add/`, 
  label_json,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const addLabelsToLabelset = async (token, labelset_id, label_ids) => {
  return dataAxios.post(`/labelsets/${labelset_id}/add_labels/`, 
  {
    labels: label_ids
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const removeLabelsToLabelset = async (token, labelset_id, label_ids) => {
  return dataAxios.post(`/labelsets/${labelset_id}/remove_labels/`, 
  {
    labels: label_ids
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const updateLabelset = async (token, labelset_json) => {

  let submission_json = {...labelset_json}
  let calls = [];
  let multipart = false;

  // Solution to trying to submit image AND json simultaneosly: https://stackoverflow.com/questions/30176570/using-django-rest-framework-how-can-i-upload-a-file-and-send-a-json-payload

  // Icon files are not going to be handled with rest of data (except for with shared_with due to me not thinking of decoupling files
  // from rest of REST commands... due to way that shared_with handler is written on server, pretty much need to serialize it for now)
  const data = new FormData();
  if (submission_json.hasOwnProperty("icon") && validDataUrl(submission_json["icon"])) {
    multipart = true;
    let blob = dataURLtoBlob(submission_json["icon"]);
    data.append('icon', blob, blob.fileName);
    delete submission_json["icon"];
  }
  if (submission_json.hasOwnProperty("shared_with") && _.isArray(submission_json["shared_with"]) && _.every(submission_json["shared_with"], _.isObject)  ) {
    multipart = true;
    data.append('shared_with', JSON.stringify(submission_json["shared_with"]));
    delete submission_json["shared_with"];
  }

  delete submission_json["id"];

  if (multipart) {
    calls.push(await dataAxios.patch(`/labelsets/${labelset_json.id}/`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000
      }));
  }
  
  // If there's any data in the json left after removing multipart fields and the id, patch that data.
  if(submission_json) {
    console.log("Submission json submit", submission_json);
    calls.push(await dataAxios.patch(`/labelsets/${labelset_json.id}/`,
    submission_json,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    }));
  }
  
  return calls.length > 0 ? calls[calls.length-1] : null;
  
}

// ########################## SEARCH API CALLS ##########################
// This is a read-only endpoint which returns more objects with fewer fields...
// for use in multi-selects or the like. 
export const getLabelsetSearchList = async (token, selected_page=1, search_term="") => {
  return dataAxios.get(`/search_labelsets/?page=${selected_page}&text_search=${search_term}`, {
      headers: {
      'Authorization': `Bearer ${token}`
      },
      timeout: 30000
  });
}
