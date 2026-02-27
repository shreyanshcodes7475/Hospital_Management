const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { default: validateEditData } = require('../middleware/validateEditData');
const { json } = require('express');

const registerUser = async (req, res) => { 
    try{
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if(!validator.isStrongPassword(password)){
            return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols' });
        }   
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
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
        res.status(201).json({ message: 'User registered successfully'});
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }   
}


// API FOR USER LOGIN
const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true,sameSite: 'strict'});
        res.status(200).json({ message: 'User logged in successfully'});
    }
    catch(error){
        res.status(500).json({ message: 'Error logging in user', error: error.message });

    }
}

// api to get user profile
const getProfile = async (req,res)=>{
    try{
        const user=req.user;
        console.log(user);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }   
        res.status(200).json({message:'User profile fetched successfully',user});
    }
    catch(error){
        res.status(500).json({message:'Error fetching user profile',error:error.message});
    }
}


// edit user profile
const editProfile=async (req,res)=>{   
    try{
        const user=req.user;
        if(!validateEditData(req)){
            return res.status(400).json({message:'Invalid fields in request body'});
        }
        const {name,phone,address,dob,gender}=req.body;
        if(!name || !phone || !address || !dob || !gender){
            return res.status(400).json({message:'All fields are required'});
        }
        await User.findByIdAndUpdate(user._id,{name,phone,
            address:json.parse(address),
            dob,
            gender
        })

        await user.save();
        res.status(200).json({message:'User profile updated successfully'});
    }
    catch(error){       
        res.status(500).json({message:'Error editing user profile',error:error.message});
    }
}

const uploadProfilePicture=async (req,res)=>{
    try{
        const user=req.user;
        if(!req.file){
            return res.status(400).json({message:'No file uploaded'});
        }

        if(user.image && user.image!=="https://media.istockphoto.com/id/1478688327/vector/user-symbol-account-symbol-vector.jpg?s=612x612&w=0&k=20&c=N1Wxw0XjkUoXT9_Vaxa4SNIj1IvdJ2L2GQfEVVMTaFM="){
            // delete the previous profile picture from cloudinary
            const publicId=user.image.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(publicId);    
        }           
        // upload the new profile picture to cloudinary
        const result=await cloudinary.uploader.upload(req.file.path,{
            folder:'profile_pictures',
            width:500,
            height:500,
            crop:'fill'
        });
        user.image=result.secure_url;
        await user.save();
        res.status(200).json({message:'Profile picture uploaded successfully',imageUrl:result.secure_url});
    }
    catch(error){
        res.status(500).json({message:'Error uploading profile picture',error:error.message});
    }   
}




module.exports = { registerUser, loginUser, getProfile, editProfile, uploadProfilePicture };        