const Doctor = require('../models/doctorModel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const validator=require('validator');
const Appointment = require('../models/appointmentModel');  
const { userAuth } = require('../middleware/userAuth');
const { User } = require('../models/userModel');
const { ValidateDoctorEditData } = require('../middleware/validateEditData');
const cloudinary=require("../config/cloudinary")
const uploadToCloudinary = require('../utils/uploadTOCloudinary');
const {getPublicIdFromUrl}=require("../controller/userController")

// login---
const loginDoctor = async(req, res) => {       
    try{
    const { email, password } = req.body;  
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({ message: 'Invalid email format' });
    }
    const doctor=await Doctor.findOne({ email });
    if (!doctor) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const token=jwt.sign({_id:doctor._id},process.env.JWT_SECRET,{expiresIn:'7d'});
    res.cookie('token', token, { httpOnly: true,sameSite: 'strict'});
    res.json({ message: 'Doctor logged in successfully', token });
    }
    catch(error){
        res.status(500).json({ message: 'Error logging in doctor', error: error.message });
    }
}

// change availibilty
const changeAvailability=async (req,res)=>{
    try{
        const doctor=req.doctor;
        doctor.available=!doctor.available;
        await doctor.save();
        res.status(200).json({success:true,message:'Doctor availability changed successfully',available:doctor.available});   
    }
    catch(error){
        res.status(500).json({ success:false,message: 'Error changing doctor availability', error: error.message });
    }
}

// get doctor profile
const getProfile = async (req,res)=>{
    try{
        const doctor=req.doctor;
        if(!doctor){
            return res.status(404).json({success:false,message:'Doctor not found'});
        }
        res.status(200).json({success:true,doctor});
    }
    catch(error){
        res.status(500).json({ 
            success:false,
            message: 'Error fetching doctor profile', error: error.message });
    }
}

// update doctor profile
const updateProfile=async (req,res)=>{
    try{
        const doctor=req.doctor;
        if(!ValidateDoctorEditData(req)){
            return res.status(400).json({success:false,message:'Invalid fields in request body'});
        }

        const {phone,address,fees,about}=req.body;
        const updatedDoctor=await Doctor.findByIdAndUpdate(doctor._id,{phone,address,fees,about},{new:true});
        res.status(200).json({success:true,message:'Doctor profile updated successfully',updatedDoctor}); 
    }
    catch(error){
        res.status(500).json({ 
            success:false,
            message: 'Error updating doctor profile', error: error.message });  
    }
}

// update profile picture
const uploadProfilePicture=async(req,res)=>{
    try{
        const doctor=req.doctor;
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"No file are uploaded"
            })
        }

        if(doctor.image && doctor.image!=="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjOUpYEb4Vm2qeuKKsBkcfkd886b_GtspcFQ&s"){
            // delete the previous image
            const publicId =getPublicIdFromUrl(doctor.image);
            await cloudinary.uploader.destroy(publicId);
        }

        // upload the new profile picture
        const base64=req.file.buffer.toString("base64");
        const result=await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64}`,{
            folder:'profilepicture',
            width:500,
            height:500,
            crop:'fill'
        })
        console.log(result);
        doctor.image=result.secure_url;
        await doctor.save();
        res.status(200).json({
            success:true,
            message:'Profile picture uploaded successfully',
            imageUrl:result.secure_url
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Error uploading profile picture",
            error:error.message
        })
    }
}

// doctor appointment list
const appointmentList=async (req,res)=>{
    try{
        const doctor=req.doctor;
        const appointments=await Appointment.find({docId:doctor._id}).populate('userId').sort({date:-1});
        res.status(200).json({success:true,appointments});
    }
    catch(error){
        res.status(500).json({ 
            success:false,
            message: 'Error fetching doctor appointments', error: error.message });
    }
}

// appointment complete api
const appointmentComplete=async (req,res)=>{
    try{
        const doctor=req.doctor;
        const appointmentId=req.params.id;
        const appointment=await Appointment.findById(appointmentId);
        if(!appointment){
            return res.status(404).json({success:false,message:'Appointment not found'});
        }
        if(appointment.docId.toString()!==doctor._id.toString()){
            return res.status(401).json({success:false,message:'Unauthorized to complete it'});
        }

        if(appointment.cancelled){
            return res.status(401).json({
                success:false,
                message:"Appointment is already cancelled"

            })
        }
        if(appointment.isCompleted){
            return res.status(200).json({
                success:true,
                message:"Appointment marked as completed"
            })
        }
        appointment.isCompleted=true;
        await appointment.save();
        res.status(200).json({success:true,message:'Appointment marked as completed'});
    }
    catch(error){
        res.status(500).json({ 
            success:false,
            message: 'Error completing appointment', error: error.message }); 
    }
}

// appointment cancel api
const appointmentCancel=async (req,res)=>{
    try{
        const doctor=req.doctor;
        const appointmentId=req.params.id;
        const appointment=await Appointment.findById(appointmentId);
        if(!appointment){
            return res.status(404).json({success:false,message:'Appointment not found'});
        }  

        if(appointment.docId.toString()!==doctor._id.toString()){
            return res.status(401).json({success:false,message:'Unauthorized to cancel it'});
        }

        if(appointment.isCompleted){
            return res.status(401).json({
                success:false,
                message:"Appointment already completed"
            })
        }

        if(appointment.cancelled){
            return res.status(200).json({
                success:true,
                message:"Appointment cancelled successfully"
            })
        }
        appointment.cancelled=true;
        await appointment.save();
        res.status(200).json({success:true,message:'Appointment cancelled successfully'});     
    }
    catch(error){
        res.status(500).json({ 
            success:false,
            message: 'Error cancelling appointment', error: error.message }
        );     
    }
}

module.exports = { loginDoctor,getProfile,changeAvailability,updateProfile,appointmentList,appointmentComplete,appointmentCancel,uploadProfilePicture };

