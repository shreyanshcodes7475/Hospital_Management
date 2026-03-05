const express = require('express');
const doctorrouter = express.Router();
const { loginDoctor,getProfile,changeAvailability,updateProfile,appointmentList,appointmentComplete,appointmentCancel,uploadProfilePicture, doctorDashboard } = require('../controller/doctorController');   
const {doctorAuth}=require('../middleware/DoctorAuth');
const { upload } = require('../middleware/multer');


doctorrouter.post('/login', loginDoctor);
doctorrouter.get('/profile', doctorAuth, getProfile);
doctorrouter.patch('/change-availability', doctorAuth, changeAvailability);
doctorrouter.patch('/edit', doctorAuth, updateProfile);
doctorrouter.post('/upload-profile-picture', doctorAuth,upload.single('profilePicture') ,uploadProfilePicture);
doctorrouter.get('/appointments', doctorAuth, appointmentList); 
doctorrouter.post('/appointments/:id/complete',doctorAuth, appointmentComplete);
doctorrouter.post('/appointments/:id/cancel',doctorAuth, appointmentCancel);
doctorrouter.get('/dashboard', doctorAuth,doctorDashboard)

module.exports = {doctorrouter};