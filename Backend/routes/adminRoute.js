const express=require('express');   
const { addDoctor,adminLogin ,allDoctors,adminDashboard,adminLogout, removeDoctor }=require("../controller/admincontroller")
const { adminAuth } = require('../middleware/adminAuth');


const  adminRouter =express.Router();

adminRouter.post('/login',adminLogin);
adminRouter.post('/add-doctor',adminAuth,addDoctor);
adminRouter.get('/doctors',adminAuth,allDoctors);
adminRouter.delete('/remove-doctor', adminAuth, removeDoctor);
adminRouter.get('/dashboard',adminAuth,adminDashboard);
adminRouter.post('/logout',adminAuth,adminLogout);



module.exports={adminRouter};