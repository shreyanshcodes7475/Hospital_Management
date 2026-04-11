const express = require('express');
const   userRouter=express.Router();
const { userAuth } = require('../middleware/userAuth');
const { registerUser, loginUser,getProfile,uploadProfilePicture,bookAppointment,getAppointments,cancelAppointment,editProfile,googlelogin} = require('../controller/userController');
const { upload } = require('../middleware/multer');

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', userAuth, getProfile);
userRouter.patch('/edit', userAuth, editProfile);
userRouter.post('/upload-profile-picture', userAuth,upload.single('profilePicture') ,uploadProfilePicture);
userRouter.post('/book-appointment', userAuth, bookAppointment);
userRouter.get('/appointments', userAuth, getAppointments);
userRouter.post('/cancel-appointment', userAuth, cancelAppointment);
userRouter.post('/google-login', userAuth, googlelogin);
module.exports = { userRouter };