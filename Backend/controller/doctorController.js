const { Doctor } = require('../models/doctorModel');
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


module.exports = { loginDoctor };
