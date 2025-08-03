// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import MyPetPage from './pages/MyPetPage';
import MyPetProfile from './components/MyPetProfile/MyPetProfile';
import MyPetEditPage from './components/MyPetProfile/MyPetEditPage';
import Main from './components/Main/Main';
import AbandonedPetPage from './pages/AbaondonedPetPage';
import AdminAbandonedPets from './components/Admin/AdminAbandonedPets';
import CommunityPage from './pages/Community';
import CommunityPost from './components/Community/Post/CommunityPost'; // 글 작성 컴포넌트
import CommunityGet from './components/Community/Get/CommunityGet';
import CommunityDetail from './components/Community/Get/CommunityGet';
import CommunityEdit from './components/Community/Edit/CommunityEdit';
import AdoptList from './components/Adopt/AdoptList';
import AdoptApplications from './components/Admin/AdoptApplications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypet/register" element={<MyPetPage />} />
        <Route path="/mypet/edit/:petId" element={<MyPetEditPage />} />
        <Route path='/mypet/profile/:petId' element={<MyPetProfile />} />
        <Route path='/main' element={<Main />} />
        <Route path='/abandonedpet/register' element={<AbandonedPetPage />} />
        <Route path="/admin/abandoned-pets" element={<AdminAbandonedPets />} />
        <Route path="/adopt" element={<AdoptList />} />
        <Route path='/admin/adopt-applications' element={<AdoptApplications />} />
        
        <Route path='/community' element={<CommunityPage />} />
        <Route path='/community/createPost' element={<CommunityPost />} />
        <Route path='/community/posts' element={<CommunityGet />} />
        <Route path="/community/:postId" element={<CommunityDetail />} />
        <Route path='/community/:postId/edit' element={<CommunityEdit />} />

      </Routes>
    </Router>
  );
}

export default App;
