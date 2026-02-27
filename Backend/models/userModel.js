const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true       
    },
    image:{
        type:String,
        default:"https://media.istockphoto.com/id/1478688327/vector/user-symbol-account-symbol-vector.jpg?s=612x612&w=0&k=20&c=N1Wxw0XjkUoXT9_Vaxa4SNIj1IvdJ2L2GQfEVVMTaFM="
    },

    address:{
        type:Object,
        default:{
            line1:"",
            line2:"",
            city:"",
            state:"",
            postal_code:"",
            country:""
        }
    },

    gender:{
        type:String,
        default:"Not selected",
        enum:{
            values:["Male","Female","Other","Not selected"],
            message:'{VALUE} is not supported'
        }
    },

    dob:{
        type:Date,
        default:null
    },

    phone:{
        type:String,
        default:null
    },

    slots_booked:{
        type:Object,
        default:{}
    }
    // so that we can use empty object as default value for slots_booked and then we can add the booked slots in it as key-value pairs where key is the date and value is an array of booked slots on that date
},
{    timestamps:true
})

const User=mongoose.model('User',userSchema);

module.exports=User;