const { Doctor } = require('../models/doctorModel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const validator=require('validator');
const Appointment = require('../models/appointmentModel');  
const { userAuth } = require('../middleware/userAuth');
const { User } = require('../models/userModel');
const { ValidateDoctorEditData } = require('../middleware/validateEditData');

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
        doctor.availability=!doctor.availability;
        await doctor.save();
        res.status(200).json({success:true,message:'Doctor availability changed successfully',availability:doctor.availability});   
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
        await Doctor.findByIdAndUpdate(doctor._id,{phone,address,fees,about},{new:true});
        res.status(200).json({success:true,message:'Doctor profile updated successfully'}); 
    }
    catch(error){
        res.status(500).json({ 
            success:false,
            message: 'Error updating doctor profile', error: error.message });  
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

const appointmentComplete=async (req,res)=>{
    try{
        const doctor=req.doctor;
        const {appointmentId}=req.body;
        const appointment=await Appointment.findById(appointmentId);
        if(!appointment){
            return res.status(404).json({success:false,message:'Appointment not found'});
        }
        if(appointment.docId.toString()!==doctor._id.toString()){
            return res.status(401).json({success:false,message:'Unauthorized'});
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

const appointmentCancel=async (req,res)=>{
    try{
        const doctor=req.doctor;
        const {appointmentId}=req.body;
        const appointment=await Appointment.findById(appointmentId);
        if(!appointment){
            return res.status(404).json({success:false,message:'Appointment not found'});
        }  

        if(appointment.docId.toString()!==doctor._id.toString()){
            return res.status(401).json({success:false,message:'Unauthorized'});
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

module.exports = { loginDoctor,getProfile,changeAvailability,updateProfile,appointmentList,appointmentComplete,appointmentCancel };

