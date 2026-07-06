const express = require('express');
const   userRouter=express.Router();
const { userAuth } = require('../middleware/userAuth');
const { registerUser, loginUser,getProfile,uploadProfilePicture,bookAppointment,getAppointments,cancelAppointment,editProfile,googlelogin,LogoutUser,isAuthenticated,checkSlotAvailability, removeProfilePicture} = require('../controller/userController');
const { allDoctors } = require('../controller/admincontroller');
const { upload } = require('../middleware/multer');

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', userAuth, LogoutUser);
userRouter.get('/auth', userAuth, isAuthenticated);
userRouter.get('/profile', userAuth, getProfile);
userRouter.patch('/edit', userAuth, editProfile);
userRouter.post('/upload-profile-picture', userAuth,upload.single('profilePicture') ,uploadProfilePicture);
userRouter.get('/remove-profile-picture', userAuth, removeProfilePicture);
userRouter.post('/book-appointment', userAuth, bookAppointment);
userRouter.get('/appointments', userAuth, getAppointments);
userRouter.post('/cancel-appointment', userAuth, cancelAppointment);
userRouter.post('/google-login',googlelogin);
userRouter.get('/doctors',allDoctors);
userRouter.post('/check-slot-availability', userAuth, checkSlotAvailability);

module.exports = { userRouter };