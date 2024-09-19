import axios from 'axios';

const BASE_URL = 'https://vega.vinhuser.one/api/v1'

export const API = axios.create({
    baseURL: BASE_URL
})