const validateUserEditData=(req)=>{
    
    const allowedFields=['phone','address','dob','gender'];
    
    return Object.keys(req.body).every((field)=>{
        return allowedFields.includes(field);
    })
} 


const ValidateDoctorEditData=(req)=>{
    const allowedFields=['phone','address','fees','about'];
    return Object.keys(req.body).every((field)=>{
        return allowedFields.includes(field);
    })
}
module.exports = { validateUserEditData, ValidateDoctorEditData };