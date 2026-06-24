const axios = require('axios');
const config = require('../config');

const laravelClient = axios.create({
  baseURL: config.laravel.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-Service-Key': config.laravel.serviceSecret,
  },
  timeout: 15000,
});

module.exports = laravelClient;
