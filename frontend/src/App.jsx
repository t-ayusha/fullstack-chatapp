import React, { useEffect } from 'react'
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import SettingPage from './pages/SettingPage';
import ProfilePage from './pages/ProfilePage';
import CallModal from './components/CallModal';
import { Routes,Route,Navigate } from 'react-router-dom'; //Route for specific routes
import {Toaster} from "react-hot-toast";

import { axiosInstance } from './lib/axios';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

import {Loader} from "lucide-react";

const App = () => {
  //authenticate user
  const {authUser,checkAuth,isCheckingAuth,onlineUsers}=useAuthStore() //useAuthStore() is a hook and herewe are destructuring the function
  //here checkAuth is there to check user when we open any page
  const{theme}=useThemeStore()

  console.log({onlineUsers});

  useEffect(()=>{
    checkAuth();
  },[checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  console.log({authUser});
  if(isCheckingAuth && !authUser) 
    return(
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  )
  return (
    <div>

      <Navbar  />
      <Routes>
        <Route path="/" element={authUser? <HomePage/> : <Navigate to="/login"/> }/> {/*if not authorized then navigate to login*/}
        <Route path="/login" element={!authUser? <LoginPage/>: <Navigate to="/"/> }/>
        <Route path="/signup" element={!authUser? <SignUpPage/> : <Navigate to="/"/> }/>
        <Route path="/settings" element={<SettingPage/>}/>
        <Route path="/profile" element={authUser? <ProfilePage/> :<Navigate to="/login"/> }/>
        
      </Routes>

      <Toaster/>
      <CallModal />

    </div>
  )
};

export default App