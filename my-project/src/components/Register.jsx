import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo1 from '../assets/d3.png'
import Navbar from './Navbar';
function Register() {
    const navigate=useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, { email, password,name,phone });
      toast.success('Registration successful!');
      navigate('/users');
    } catch (error) {
        toast.error(`Registration failed: ${error.response?.data?.message || error.message}`); 
    }
  };

  return (
    <div className='flex mx-auto'>
{/* <Navbar/> */}
   
    <div className='w-[88rem] ml-[45%] mt-[10%]'>
      <h2 className="text-xl font-bold ml-[12%] mb-8">Create User</h2>
     {/* <img className='w-[30%] ml-[5%] mb-[5%]' src={logo1}/> */}
      <form onSubmit={handleRegister} className="flex mt-[5%] w-[40%] flex-col gap-2">
      <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Phone-no"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-orange-500 mt-[3%] transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 text-white p-2 rounded">Create User</button>
      </form>
    </div>
    </div>
  );
}

export default Register;
