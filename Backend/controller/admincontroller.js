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
        specialization:specialization.trim(),
        degree,
        address:{
            city: address.city.trim(),
            state: address.state.trim()
        },
        gender:gender.trim()  
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
        const page=parseInt(req.query.page) || 1;
        const limit=parseInt(req.query.limit) || 10;
        const skip=(page-1)*limit;          

        const specialization_filter=req.query.specialization || "";
        const location_filter=req.query.location || "";
        const docemail_filter=req.query.email || "";
        
        
        const query={};
        if(specialization_filter?.trim()){
            query.specialization={$regex:specialization_filter.trim(), $options:'i'};
        }
        
        if(location_filter?.trim()){
            query["address.city"]={$regex:location_filter.toLowerCase().trim(), $options:'i'};
        }
        
        if(docemail_filter?.trim()){
            query.email={$regex:docemail_filter.trim(), $options:'i'};
        }
        
        const total=await Doctor.countDocuments(query);
        const totalPages=Math.ceil(total/limit);
        const doctors=await Doctor.find(query).skip(skip).limit(limit).select('-password -slots_booked -earning');
        res.json({
            success:true,
            doctors,
            total,
            totalPages,
            currentPage: page
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"error occured while fetching data"
            
        })
    }
}

const removeDoctor = async (req, res) => {
    try{
        const {doctorEmail} = req.body;
        if(!doctorEmail){
            return res.status(400).json({
                success:false,
                message:"Doctor Email is required"
            });
        }
        const doctor = await Doctor.findOneAndDelete({email: doctorEmail});   

        if(!doctor){
            return res.status(404).json({
                success:false,
                message:"Doctor not found"
            });
        }


        res.json({success:true, message:"Doctor removed successfully"})
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Error occured in removing doctor"
        })
    }
}

const adminDashboard = async (req, res)=>{
try {
        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await User.countDocuments({});
        const totalAppointments = await Appointment.countDocuments();
        const cancelledAppointments = await Appointment.countDocuments({
            cancelled: true
        });
        const completedAppointments = await Appointment.countDocuments({
            isCompleted: true
        });

        res.status(200).json({
            totalDoctors,
            totalPatients,
            totalAppointments,
            cancelledAppointments,
            completedAppointments
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const adminLogout = async (req, res) => {
    try{
        res.clearCookie('token');
        res.status(200).json({
            success:true,
            message:"Succesfully logout"
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Error occured in admin logout"
        })
    }
}
module.exports = { addDoctor,adminLogin ,allDoctors,removeDoctor,adminDashboard,adminLogout};