require("dotenv").config();
const { connectDb } = require("./config/mongodb");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const { userRouter } = require('./routes/userRoute');
const { doctorrouter } = require('./routes/doctorRoute'); 
const { adminRouter } = require("./routes/adminRoute");
const cors=require("cors")
const multer = require('multer');

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Explicitly allow PATCH
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

app.use(express.json()); // req wali body ko json me convert krne ke liye
app.use(cookieParser());
app.use('/api/admin',adminRouter)
app.use('/api/users', userRouter);
app.use('/api/doctors', doctorrouter);  
app.get('/', (req, res) => {
  res.send('api working !');
});



app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Please upload exactly one file"
            });
        }
    }
    res.status(400).json({
        success: false,
        message: err.message
    });
});


connectDb().then(()=>{
  console.log("Connected to MongoDB");
  app.listen(port, () => {  console.log(`Example app listening at http://localhost:${port}`);
})
}).catch((err)=>{
  console.log("Failed to connect to MongoDB", err);
});