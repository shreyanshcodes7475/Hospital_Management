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
        const token=jwt.sign({userId:newUser._id},process.env.JWT_SECRET,{expiresIn:'7d'});        
        res.status(201).json({ message: 'User registered successfully', token });
    }
    catch(error){
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'User logged in successfully', token });
    }
    catch(error){
        res.status(500).json({ message: 'Error logging in user', error: error.message });

    }
}


