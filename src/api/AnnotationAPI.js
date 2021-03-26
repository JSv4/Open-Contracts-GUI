import dataAxios from './http';

//########################## ANNOTATION API CALLS ##########################
export const getAnnotations = async (token, selected_page='', search_term='') => {
    return dataAxios.get(`/annotations/?page=${selected_page}&text_search=${search_term ? search_term : ""}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
  }

export const getAnnotationData = async (token, contract_id, corpus_id="") => {
    return dataAxios.get(`/annotations/${contract_id}/get_data/?corpus=${corpus_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000
      });
} 

export const updateDocAnnotationDataForCorpus = async (token, document_id, corpus_id, annotation_json) => {
  return dataAxios.post(`/annotations/${document_id}/update_annotation_for_corpus/${corpus_id}/`,
  annotation_json,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000
  });
}

// EVERYTHING ABOVE CANDIDATE FOR DELETION

export const createAnnotation = async (token, annotation_json) => {
  return dataAxios.post(`/annotations/`, 
    annotation_json,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    }
  );
}

export const deleteAnnotation = async (token, annotation_id) => {
  return dataAxios.delete(`/annotations/${annotation_id}/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    }
  );
}
