const cloudinary = require("../config/cloudinary");
const streamfiery = require("streamifier");

const uploadToCloudinary = async (buffer) => {
    return new Promise((resolve,reject)=>{
        const uploadStream=cloudinary.uploader.upload_stream((error,result)=>{
            if(error) return reject(error);
            resolve(result);    
        })
        streamfiery.createReadStream(buffer).pipe(uploadStream);
    })
}


export default uploadToCloudinary;