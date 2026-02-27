const validateEditData=(res)=>{
    
    const allowedFields=['name','phone','address','dob','gender'];

    return Object.keys(req.body).every((field)=>{
        allowedFields.includes(field);  
    })


} 
export default validateEditData;