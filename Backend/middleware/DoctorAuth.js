const jwt =require("jsonwebtoken");
const Doctor = require('../models/doctorModel');

const doctorAuth=async (req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }
    const decodedobj=jwt.verify(token,process.env.JWT_SECRET);
    if(!decodedobj){
        return res.status(401).json({message:'Unauthorized'});
    }
    const {_id}=decodedobj;
    const doctor=await Doctor.findById(_id);
    if(!doctor){
        res.status(401).json({message:'Unauthorized'});
    }
    req.doctor=doctor; //to take doctor so that we can use it in other routes
    next(); 
}

module.exports={doctorAuth};