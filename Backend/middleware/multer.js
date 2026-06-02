const multer=require('multer');
const path = require("path");
const storage=multer.memoryStorage();

const allowedTypes=  [
"image/jpeg",
"image/png",
"image/jpg",
"image/webp"
];
 const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];

const upload=multer({
    storage:storage,
    limits:{fileSize:5*1024*1024},
    fileFilter:(req,file,cb)=>{
        const ext = path.extname(file.originalname).toLowerCase();
        if(allowedExt.includes(ext) && allowedTypes.includes(file.mimetype)){
            cb(null,true)
        }
        else{
            cb(new Error("Only image files are allowed!"),false)
        }
    }
});     


module.exports = { upload };