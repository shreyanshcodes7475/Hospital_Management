const mongoose = require('mongoose');

const doctorSchema =new mongoose.Schema({
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
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjOUpYEb4Vm2qeuKKsBkcfkd886b_GtspcFQ&s",
        required:true
    },

    speciality:{
        type:String,
        required:true   
    },

    degree:{
        type:String,
        required:true   
    }, 

    experience:{ 
        type:Number,
        required:true   
    },

    about:{
        type:String,
        required:true,
        default:"This is a default about section given by us"  
    },

    available:{
        type:Boolean,
        default:true
    },

    fees:{
        type:Number,   
        required:true
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

    date:{
        type:Number,
        required:true
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
}, {
    timestamps:true,
    minimize:false

});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = {Doctor};