const express=require('express');   
const {addDoctor}=require("../controller/admincontroller")
const { adminAuth } = require('../middleware/AdminAuth');
const  adminRouter =express.Router();

adminRouter.post('/Add-Doctor',addDoctor);

module.exports={adminRouter};