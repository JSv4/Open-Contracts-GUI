import dataAxios from './http';
import _ from 'lodash';
import { dataURLtoBlob } from '../utils/helperFunctions';
import validDataUrl from 'valid-data-url';

//########################## CONTRACTS API CALLS ##########################
export const getContractAnnotations = async (token, document_id, corpus_id) => {
  return dataAxios.get(`/documents/${document_id}/get_annotations/${corpus_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const getContractRelations = async (token, document_id, corpus_id) => {
  return dataAxios.get(`/documents/${document_id}/get_relations/${corpus_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const getContracts = async (token, selected_page=1, search_term="", for_corpus_id="") => {
    return dataAxios.get(`/documents/?page=${selected_page}&text_search=${search_term}&corpus=${for_corpus_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
  }

export const deleteContract = async (token, contract_id) => {
  return dataAxios.delete(`/documents/${contract_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

export const deleteMultipleContracts = async(token, documents) => {
  return dataAxios.delete(`/documents/bulk_delete/`, 
  {
    headers: {
    'Authorization': `Bearer ${token}`
    },
    data: { documents },
    timeout: 30000
});
}

export const getCorpusContracts = async(token, corpus_id) => {
    return dataAxios.get(`/corpuses/${corpus_id}/all_documents/`, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}

export const getCorpusAnnotations = async(token, corpus_id, text_search, label_id, page=1) => {
  return dataAxios.get(`/corpuses/${corpus_id}/get_annotations/?page=${page}&text_search=${text_search}&label_id=${label_id}`, {
      headers: {
      'Authorization': `Bearer ${token}`
      },
      timeout: 30000
  });
}

export const getAnnotatedDocsForCorpus = async (token, corpus_id) => {
    return dataAxios.get(`/annotations/?corpus=${corpus_id}`, {
        headers: {
        'Authorization': `Bearer ${token}`
        },
        timeout: 30000
    });
}

export const uploadContract = async (token, file, meta_json) => {

  const data = new FormData();
  data.append('pdf_file', file);
  data.append('name', file.name);

  console.log("Meta json is: ", meta_json);

  for ( var key in meta_json ) {
    data.append(key, meta_json[key]);
  }

  return dataAxios.post(`/documents/`, data, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000,
  });

};

export const updateContractRequest = async (token, contract_json) => {
  
  console.log("update contract", contract_json);
  let submission_json = {...contract_json}
  
  const data = new FormData();

  if (submission_json.hasOwnProperty("shared_with") && _.isArray(submission_json["shared_with"]) && _.every(submission_json["shared_with"], _.isObject)  ) {
      data.append('shared_with', JSON.stringify(submission_json["shared_with"]));
      delete submission_json["shared_with"];
  }

  if (submission_json.hasOwnProperty("pdf_file") && validDataUrl(submission_json["pdf_file"])) {
    let blob = dataURLtoBlob(submission_json["pdf_file"]);
    data.append('pdf_file', blob, blob.fileName);
    delete submission_json["pdf_file"];
  }

  for (var key in submission_json) {
      if (submission_json.hasOwnProperty(key)) {
          data.append(key, submission_json[key]);
      }
  }

  return dataAxios.patch(`/documents/${contract_json.id}/`, data, {
      headers: {
      'Authorization': `Bearer ${token}`
      },
      timeout: 30000,
  });
}