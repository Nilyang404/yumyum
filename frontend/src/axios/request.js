import axios from 'axios';
import { message } from 'antd';

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

axios.interceptors.response.use(
  (response) => {
    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else {
      return Promise.reject(response.message);
    }
  },
  error => {
    if (error.response) {
      message.error(error.response.data || error.message);
      return Promise.reject(error.response.data || error.message);
    }
    return Promise.reject(error);
  }
);

function request (config) {
  return axios({
    timeout: 30 * 1000, // set timeout as 30s
    ...config
  });
}

export default request;
