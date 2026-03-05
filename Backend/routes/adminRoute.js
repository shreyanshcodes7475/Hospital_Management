const express=require('express');   
const { addDoctor,adminLogin ,allDoctors,appointmentCancel,appointmentsAdmin,adminDashboard }=require("../controller/admincontroller")
const { adminAuth } = require('../middleware/adminAuth');


const  adminRouter =express.Router();

adminRouter.post('/login',adminLogin);
adminRouter.post('/add-doctor',adminAuth,addDoctor);
adminRouter.get('/doctors',adminAuth,allDoctors);
adminRouter.post('/cancel-appointment',adminAuth,appointmentCancel);
adminRouter.get('/appointments',adminAuth,appointmentsAdmin);
adminRouter.get('/dashboard',adminAuth,adminDashboard);


module.exports={adminRouter};