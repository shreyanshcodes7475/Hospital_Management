const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { validateUserEditData } = require('../middleware/validateEditData');
const { json } = require('express');
const Doctor = require('../models/doctorModel');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadTOCloudinary');
const Appointment = require('../models/appointmentModel');
const fs = require('fs');


const registerUser = async (req, res) => { 
    try{
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success:false,
                message: 'Name, email, and password are required' });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({ success:false, message: 'Invalid email format' });
        }

        if(!validator.isStrongPassword(password)){
            return res.status(400).json({ success:false, message: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols' });
        }   
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success:false, message: 'Email is already registered' });
        }

        // password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        const token=jwt.sign({_id:newUser._id},process.env.JWT_SECRET,{expiresIn:'7d'});  
        res.cookie('token', token, { httpOnly: true,sameSite: 'strict'});      
        res.status(201).json({ 
            success:true,
            message: 'User registered successfully',
            token:token });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ 
            success:false,
            message: 'Error registering user', error: error.message
        });
    }   
}


// API FOR USER LOGIN
const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success:false, message: 'Email and password are required' });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({ success:false, message: 'Invalid email format' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success:false, message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success:false, message: 'Invalid credentials' });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true,sameSite: 'strict'});
        res.status(200).json({
            success:true,
            message: 'User logged in successfully',
            token:token
        });
    }
    catch(error){
        res.status(500).json({ 
            success:false,
            message: 'Error logging in user', error: error.message });

    }
}

// api to get user profile
const getProfile = async (req,res)=>{
    try{
        const user=req.user;
        if(!user){
            return res.status(404).json({success:false,message:'User not found'});
        }   
        res.status(200).json({
            success:true,
            message:'User profile fetched successfully',user});
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:'Error fetching user profile',error:error.message
        });
    }
}


// edit user profile
const editProfile=async (req,res)=>{   
    try{
        const user=req.user;
        if(!validateUserEditData(req)){
            return res.status(400).json({success:false,message:'Invalid fields in request body'});
        }
        const {phone,address,dob,gender}=req.body;
        if(!phone || !address || !dob || !gender){
            return res.status(400).json({success:false,message:'All fields are required'});
        }
        await User.findByIdAndUpdate(user._id,{phone,
            address:address,
            dob,
            gender
        },{runValidators:true});

        await user.save();
        res.status(200).json({
            success:true,
            message:'User profile updated successfully'});
    }
    catch(error){       
        res.status(500).json({
            success:false,
            message:'Error editing user profile',error:error.message});
    }
}


const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/'); 
  return publicIdWithVersion.split('.')[0];
};

const uploadProfilePicture=async (req,res)=>{
    try{
        const user=req.user;
        if(!req.file){
            return res.status(400).json({success:false,message:'No file uploaded'});
        }

        if(user.image && user.image!=="https://media.istockphoto.com/id/1478688327/vector/user-symbol-account-symbol-vector.jpg?s=612x612&w=0&k=20&c=N1Wxw0XjkUoXT9_Vaxa4SNIj1IvdJ2L2GQfEVVMTaFM="){
            // delete the previous profile picture from cloudinary
            const publicId=getPublicIdFromUrl(user.image);
            await cloudinary.uploader.destroy(publicId);    
        }          


         
        // upload the new profile picture to cloudinary
        const base64 = req.file.buffer.toString("base64");
        const result=await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64}`,{
            folder:'profilePicture',
            width:500,
            height:500,
            crop:'fill'
        });
        user.image=result.secure_url;
        await user.save();
        res.status(200).json({
            success:true,
            message:'Profile picture uploaded successfully',imageUrl:result.secure_url});
    }
    catch(error){
         
        res.status(500).json({
            success:false,
            message:'Error uploading profile picture',error:error.message});
    }   
}


// api to book appointment with doctor
const bookAppointment=async (req,res)=>{
    try{
        const {docId, slotDate, slotTime}=req.body;
        const user=req.user;
        if(!docId || !slotDate || !slotTime){
            return res.status(400).json({
                success:false,
                message:'Doctor ID, slot date and slot time are required'});
        }
        const docData=await Doctor.findOne({_id:docId});
        if(!docData){
            return res.status(404).json({
                success:false,
                message:'Doctor not found'});
        }

        const UpdatedDoctor=await Doctor.findOneAndUpdate({
            _id:docId,
            available:true,
            $or:[
                {[`slots_booked.${slotDate}`]:{$exists:false}},
                {[`slots_booked.${slotDate}`]:{$nin:[slotTime]}}   
            ]
        },{
            $addToSet:{[`slots_booked.${slotDate}`]:slotTime}
        },
        {returnDocument:"after"}   
    )


    if(!UpdatedDoctor){
        return res.status(400).json({
            success:false,
            message:'Selected slot is not available'});
    }



    const appointment={
        userId:user._id,
        docId,
        userData:user,
        docData,
        slotDate,
        slotTime,
        amount:docData.fees,
        date:Date.now()
    }

    const newAppointment=await new Appointment(appointment);
    await newAppointment.save();
    res.status(200).json({
        success:true,
        message:'Appointment booked successfully'});
    }
    catch(error){  
        res.status(500).json({success:false,message:'Error booking appointment',error:error.message});
    }
}


// api to get user appointments
const getAppointments=async (req,res)=>{
    try{
        const user=req.user;
        const appointments=await Appointment.find({userId:user._id}).populate('docId').sort({date:-1});
        res.status(200).json({
            success:true,
            appointments
        });   
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:'Error fetching appointments',error:error.message
        });
    }  
} 


// api to cancel appointment
const cancelAppointment=async (req,res)=>{
    try{
        const {appointmentId}=req.body;
        const user=req.user;
        if(!appointmentId){
            return res.status(400).json({
                success:false,
                message:'Appointment ID is required'});
        }

        const appointmentData=await Appointment.findById(appointmentId);
        if(!appointmentData){
            return res.status(404).json({
                success:false,
                message:'Appointment not found'});
        }

        if(appointmentData.userId.toString()!==user._id.toString()){  
            return res.status(403).json({
                success:false,
                message:'You are not authorized to cancel this appointment'});  
        }  

       const appointment =await Appointment.findByIdAndUpdate({
            _id:appointmentId,
       },{cancelled:true},
       {new:true}
       );
       
       if(!appointment){
        return res.status(400).json({
            success:false,
            message:'Error cancelling appointment'});
       }    
       
       const {docId, slotDate, slotTime}=appointmentData;
     //another approach to remove the booked slot from doctor's slots_booked array  
    //    await Doctor.findByIdAndUpdate(docId,{
    //     $pull:{[`slots_booked.${slotDate}`]:slotTime}
    //    })

       const doctorData=await Doctor.findById(docId);
       let slots_booked=doctorData.slots_booked || [];
       slots_booked[slotDate]=slots_booked[slotDate].filter(slot=>slot!=slotTime);
       await Doctor.findByIdAndUpdate(docId,{slots_booked:slots_booked});
       
         res.status(200).json({ 
            success:true,
            message:'Appointment cancelled successfully'    
         });

    }
    catch(error){
        res.status(500).json({
            success:false,
            message:'Error cancelling appointment',error:error.message
        }); 
    }
}






module.exports = { registerUser, loginUser, getProfile, editProfile, uploadProfilePicture, bookAppointment, getAppointments, cancelAppointment ,getPublicIdFromUrl};        