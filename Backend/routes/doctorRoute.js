const express = require('express');
const doctorrouter = express.Router();
const { loginDoctor,getProfile,changeAvailability,updateProfile,appointmentList,appointmentComplete,appointmentCancel } = require('../controller/doctorController');   
const {doctorAuth}=require('../middleware/DoctorAuth');
   
doctorrouter.post('/login', loginDoctor);
doctorrouter.get('/profile', doctorAuth, getProfile);
doctorrouter.patch('/change-availability', doctorAuth, changeAvailability);
doctorrouter.patch('/edit', doctorAuth, updateProfile);
doctorrouter.get('/appointments', doctorAuth, appointmentList); 
doctorrouter.post('/appointments/:id/complete',doctorAuth, appointmentComplete);
doctorrouter.post('/appointments/:id/cancel',doctorAuth, appointmentCancel);

module.exports = {doctorrouter};