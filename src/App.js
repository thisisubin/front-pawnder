// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MyPetPage from './pages/MyPetPage';
import MyPetProfile from './components/MyPetProfile/MyPetProfile';
import MyPetEditPage from './components/MyPetProfile/MyPetEditPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypet/register" element={<MyPetPage />} />
        <Route path="/mypet/edit/:petId" element={<MyPetEditPage />} />
        <Route path='/mypet/profile' element={<MyPetProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
