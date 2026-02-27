require("dotenv").config();
const { connectDb } = require("./config/mongodb");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const { userRouter } = require('./routes/userRoute');
const { doctorrouter } = require('./routes/doctorRoute'); 


app.use(express.json()); // req wali body ko json me convert krne ke liye
app.use(cookieParser());

app.use('/api/users', userRouter);
app.use('/api/doctors', doctorrouter);  
app.get('/', (req, res) => {
  res.send('api working !');
});

connectDb().then(()=>{
  console.log("Connected to MongoDB");
  app.listen(port, () => {  console.log(`Example app listening at http://localhost:${port}`);
})
}).catch((err)=>{
  console.log("Failed to connect to MongoDB", err);
});