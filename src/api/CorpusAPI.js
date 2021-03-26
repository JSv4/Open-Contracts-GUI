import dataAxios from './http';
import { dataURLtoBlob } from '../utils/helperFunctions';
import _ from 'lodash';
import validDataUrl from 'valid-data-url';

//########################## CORPUS API CALLS ##########################
export const uploadCorpus = async (token, file) => {
  
  console.log("Upload file", file);

  const data = new FormData();
  const blob = dataURLtoBlob(file);

  console.log("File blob", blob);
  
  data.append('file', blob, blob.fileName);

  return dataAxios.post(`/corpuses/upload_corpus/`, data, {
      headers: {
      'Authorization': `Bearer ${token}`
      },
      timeout: 30000,
  });

}


export const updateCorpus = async (token, corpus_json) => {
  
  console.log("update corpus", corpus_json);
  let submission_json = {...corpus_json}
  
  const data = new FormData();

  if (submission_json.hasOwnProperty("shared_with") && _.isArray(submission_json["shared_with"]) && _.every(submission_json["shared_with"], _.isObject)  ) {
      data.append('shared_with', JSON.stringify(submission_json["shared_with"]));
      delete submission_json["shared_with"];
  }

  if (submission_json.hasOwnProperty("icon") && validDataUrl(submission_json["icon"])) {
    let blob = dataURLtoBlob(submission_json["icon"]);
    data.append('icon', blob, blob.fileName);
    delete submission_json["icon"];
  }

  for (var key in submission_json) {
      if (submission_json.hasOwnProperty(key)) {
          data.append(key, submission_json[key]);
      }
  }

  return dataAxios.patch(`/corpuses/${corpus_json.id}/`, data, {
      headers: {
      'Authorization': `Bearer ${token}`
      },
      timeout: 30000,
  });
}

export const createCorpus = async (token, corpus_json) => {
  
  let submission_json = {...corpus_json}
  const data = new FormData();

  if (submission_json.hasOwnProperty("icon") && validDataUrl(submission_json["icon"])) {
    let blob = dataURLtoBlob(submission_json["icon"]);
    data.append('icon', blob, blob.fileName);
    delete submission_json["icon"];
  }
  if (submission_json.hasOwnProperty("shared_with") && _.isArray(submission_json["shared_with"]) && _.every(submission_json["shared_with"], _.isObject)  ) {
    data.append('shared_with', JSON.stringify(submission_json["shared_with"]));
    delete submission_json["shared_with"];
  }

  for (var key in submission_json) {
    if (submission_json.hasOwnProperty(key)) {
        data.append(key, submission_json[key]);
    }
  }

  return dataAxios.post(`/corpuses/`, data, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000,
  });

};

export const getCorpuses = async (token, selected_page, search_term) => {
    return dataAxios.get(`/corpuses/?page=${selected_page}&text_search=${search_term ? search_term : ""}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
  }

/**
 * This makes a request to a different API route that uses a lighter-weight serializer with more results that will be used
 * to source results for search fields.
 * 
 * @param {*} token 
 * @param {*} selected_page 
 * @param {*} search_term 
 */
export const searchCorpuses = async (token, selected_page, search_term) => {
  return dataAxios.get(`/search_corpuses/?page=${selected_page}&text_search=${search_term ? search_term : ""}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

/**
 * Given an array of document IDs (document_ids), add them to the provided corpus using API route action
 * 
 * @param {*} token 
 * @param {*} corpus_id 
 * @param {*} document_ids 
 */
export const addDocsToCorpus = async (token, corpus_id, documents) => {
  return dataAxios.post(`/corpuses/${corpus_id}/add_documents/`, 
  {
    documents
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const removeDocsFromCorpus = async (token, corpus_id, documents) => {
  return dataAxios.post(`/corpuses/${corpus_id}/remove_documents/`, 
  {
    documents
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const exportCorpus = async(token, corpus_id) => {
  return dataAxios.get(`/corpuses/${corpus_id}/export/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const deleteCorpus = async (token, corpus_id) => {
  return dataAxios.delete(`/corpuses/${corpus_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}