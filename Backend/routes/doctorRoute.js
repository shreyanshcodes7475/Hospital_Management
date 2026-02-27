const express = require('express');
const doctorrouter = express.Router();
const { loginDoctor } = require('../controller/doctorController');   
   
doctorrouter.post('/login', loginDoctor);

module.exports = {doctorrouter};