const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

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
        const {name,phone,address,dob,gender}=req.body;
        const imageFile=req.file;

        if(!name || !phone || !address || !dob || !gender){
            return res.status(400).json({message:'All fields are required'});
        }   
        
    }
    catch(error){       
        res.status(500).json({message:'Error editing user profile',error:error.message});
    }
}


module.exports = { registerUser, loginUser, getProfile };