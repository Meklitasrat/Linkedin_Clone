import axios from "axios";
// this will return axios instance that will enable us to fetch;

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    // we add with credentials so as to pass cookies with our request to show authorized/authenticated accounts
    withCredentials: true
});

export default axiosInstance;