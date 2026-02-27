const jwt=require('jsonwebtoken');
const User = require('../models/userModel');


const userAuth=async (req,res,next)=>{
    // reading the token from cookie
    const {token}=req.cookies;
    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }
    const decodedobj=jwt.verify(token,process.env.JWT_SECRET);
    if(!decodedobj){
        return res.status(401).json({message:'Unauthorized'});
    }
    console.log(decodedobj);
    const {_id}=decodedobj;
    
    const user=await User.findById(_id).select('-password');
    console.log(user);
    if(!user){
        return res.status(401).json({message:'Unauthorized'});
    }
    req.user=user; //to take user so that we can use it in other routes
    next();
}

module.exports={userAuth};