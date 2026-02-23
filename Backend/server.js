require("dotenv").config();
const { connectDb } = require("./config/mongodb");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 

app.get('/', (req, res) => {
  res.send('Hello World!');
});

connectDb().then(()=>{
  console.log("Connected to MongoDB");
  app.listen(port, () => {  console.log(`Example app listening at http://localhost:${port}`);
})
}).catch((err)=>{
  console.log("Failed to connect to MongoDB", err);
});