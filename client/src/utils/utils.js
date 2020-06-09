export const getHeaders = () => {
  const headers = {
      'Content-Type': 'application/json'
    };

  const token = localStorage.getItem('token');

  if (token) {
    headers['Authorization'] = token;
  }

  return headers;
};

export const handleErrors = async res => {
  if (!res.ok) {
    throw await res.json();

  } else {
    return res;
  }
};