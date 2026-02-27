const express = require('express');
const   userRouter=express.Router();
const { userAuth } = require('../middleware/userAuth');
const { registerUser, loginUser,getProfile } = require('../controller/userController');

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', userAuth, getProfile);
module.exports = { userRouter };