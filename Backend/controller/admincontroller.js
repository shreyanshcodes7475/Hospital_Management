const Doctor = require("../models/doctorModel");
const { uploadToCloudinary } = require("../utils/uploadTOCloudinary");
const validator=require('validator');
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");


const addDoctor = async(req, res) => {
    const {name, email,password,fees,experience,specialization,degree,address, gender} = req.body;
    
    if(!name || !email || !password || !fees ||!experience || !specialization || !degree || !address || !gender){
        return res.status(400).json({
            success:false, 
            error: "All fields are required" 
        });
    }   

    if(!validator.isEmail(email)){
        return res.status(400).json({
            success:false, 
            error: "Invalid email format" 
        });
    }

    if(!validator.isStrongPassword(password)){
        return res.status(400).json({
            success:false, 
            error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol" 
        });
    }

    const existingDoctor =await Doctor.findOne({email});
    if(existingDoctor){
        return res.status(400).json({
            success:false, 
            error: "Doctor with this email already exists" 
        });
    }

    const hashedPassword=await bcrypt.hash(password,10);

    const doctor=new Doctor({
        name,
        email,
        password:hashedPassword,
        fees,
        experience,
        specialization,
        degree,
        address,
        gender
    });
    await doctor.save();
    return res.status(201).json({
        success:true,
        data:doctor
    });
};

const adminLogin=async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token=jwt.sign(email+password, process.env.JWT_SECRET);
            res.cookie('token', token, { httpOnly: true,sameSite: 'strict'});
            res.json({
                success:true,
                message:"Succesfully login",
                token
            })
        }
        else  throw new Error("INVALID ADMIN CREDENTIALS")
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Error occured in admin login"
        })
    }
}

const allDoctors=async (req,res)=>{
    try{
        const doctors=await Doctor.find({});
        res.json({
            success:true,
            doctors
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"error occured while fetching data"
            
        })
    }
}

//api to get all apointments list
const appointmentsAdmin = async (req, res)=>{
    try {
        const appointments= await Appointment.find({})
        res.json({success:true, appointments})
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
        
        
    }
}

const appointmentCancel = async (req, res)=>{

    try {
        const {appointmentId}= req.body
        const appointmentData = await Appointment.findById(appointmentId)

        await Appointment.findByIdAndUpdate(appointmentId, {cancelled: true})
        

        //releasing the cancelled appointment doctor slot

        const {docId, slotDate, slotTime}= appointmentData

        const doctorData= await doctorModel.findById(docId)


        let slots_booked= doctorData.slots_booked

        slots_booked[slotDate]=slots_booked[slotDate].filter(e=> e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({success:true, message:"Appointment Cancelled"})

    } catch (error) {
         console.log(error);
        res.json({success:false, message:error.message})   
    }

}

const adminDashboard = async (req, res)=>{
    try {
        const doctors = await Doctor.find({})
        const users= await User.find({})
        const appointments = await Appointment.find({})

        const dashData= {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }
        res.json({success: true, dashData})

        
    } catch (error) { 
        console.log(error)
        res.json({success: false, message: error.message})
    }
}
module.exports = { addDoctor,adminLogin ,allDoctors,appointmentCancel,appointmentsAdmin,adminDashboard};