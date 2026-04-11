import { useState } from 'react';
import BASE_URL from '../constants/Base_url';
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient');
  const [formData, setFormData] = useState({
    email: 'Prashant@gmail.com',
    password: 'Prashant@123',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({ email: '', password: '' });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    }); 
    setError('');
  };

  const handleGoogleLogin=async(credentialResponse)=>{
    try{
      const response = await fetch(`${BASE_URL}/users/google-login`,{
        method:'POST',
        headers:{'content-type':'application/json'},
        credentials:'include',
        body:JSON.stringify({token:credentialResponse.credential})
      })
      const data = await response.json();
      navigate('/dashboard');
    }
    catch(err){
      console.log('Google login failed:',err);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // API call will be integrated here
      console.log(`${userType} login:`, formData);
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      // Handle response...
      const data = await response.json();
      console.log('Login response:', data);
      setLoading(false);
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Hospital Management System</h1>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${
              userType === 'patient'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleUserTypeChange('patient')}
          >
            Patient
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${
              userType === 'doctor'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleUserTypeChange('doctor')}
          >
            Doctor
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${
              userType === 'admin'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleUserTypeChange('admin')}
          >
            Admin
          </button>
        </div>

        {/* Role Title */}
        <h2 className="text-center text-blue-500 text-xl font-semibold mb-6">
          {userType.charAt(0).toUpperCase() + userType.slice(1)} Login
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm border-l-4 border-red-700">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-800 font-semibold text-sm mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-800 font-semibold text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500 font-semibold hover:text-purple-600 hover:underline transition-colors">
            Sign Up here
          </a>
        </p>

        <div className='my-5 flex justify-center'>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              console.log(credentialResponse);
              handleGoogleLogin(credentialResponse);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </div>
      </div>  
    </div>
  );
}
