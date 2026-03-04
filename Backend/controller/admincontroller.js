const Doctor = require("../models/doctorModel");
const { uploadToCloudinary } = require("../utils/uploadTOCloudinary");
const validator=require('validator');
const bcrypt=require("bcrypt");


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

module.exports = { addDoctor };