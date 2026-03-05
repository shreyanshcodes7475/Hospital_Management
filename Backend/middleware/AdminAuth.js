const jwt=require("jsonwebtoken");
const adminAuth=async(req,res,next)=>{
    try{
        const {token}=req.headers;
        if(!token){
            return res.status(401).json({message:'Unauthorized Access'});
        }
        const decoded_obj=jwt.verify(token,process.env.JWT_SECRET);
        if(decoded_obj!==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
            return res.json({
                success:false,
                message:"Unauthorized Access"
            })
        }

        next();
    }
    catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

module.exports={adminAuth};