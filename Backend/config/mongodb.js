const mongoose=require("mongoose");

const connectDb=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected DB Name:", mongoose.connection.name);
        }
    catch(err){
        console.log(err);
    }
}

module.exports={connectDb};