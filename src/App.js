// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import api from './api/axios';
import Header from './components/Header/Header';
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
import MyPage from './components/MyPage/MyPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/users/check-session');
        console.log('=== 사용자 정보 받아옴 ===');
        console.log('응답 데이터:', res.data);
        console.log('응답 상태:', res.status);
        console.log('응답 헤더:', res.headers);

        // 사용자 정보 정규화 (일반 로그인 + 소셜로그인)
        const normalizedUser = normalizeUserData(res.data);
        console.log('=== 정규화된 사용자 정보 ===');
        console.log('정규화 결과:', normalizedUser);

        setUser(normalizedUser);
        console.log('=== 사용자 상태 설정 완료 ===');
        console.log('현재 user 상태:', normalizedUser);

        // 사용자 역할 정보를 전역으로 저장 (관리자 알림 구독용)
        if (normalizedUser && normalizedUser.role) {
          window.userRole = normalizedUser.role;
          console.log('사용자 역할 저장:', normalizedUser.role);
        }
      } catch (e) {
        console.log('사용자 정보 가져오기 실패:', e);
        console.log('에러 상세:', e.response?.data);
        setUser({ loggedIn: false });
        window.userRole = null;
      } finally {
        setLoading(false); // 로딩 종료
      }
    };
    fetchUser();

    // 소셜로그인 성공 감지
    const urlParams = new URLSearchParams(window.location.search);
    const socialLoginSuccess = urlParams.get('socialLogin');

    if (socialLoginSuccess === 'success') {
      // URL 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);

      // 잠시 후 사용자 정보 다시 가져오기
      setTimeout(() => {
        fetchUser();
      }, 500);
    }
  }, []);

  // 사용자 정보 정규화 함수 (일반 로그인 + 소셜로그인)
  const normalizeUserData = (userData) => {
    console.log('정규화 전 사용자 데이터:', userData);

    if (!userData) {
      console.log('사용자 데이터가 없음');
      return { loggedIn: false };
    }

    if (!userData.loggedIn) {
      console.log('로그인되지 않은 상태');
      return { loggedIn: false };
    }

    const normalizedUser = {
      loggedIn: true,
      userId: userData.userId || userData.username || (userData.user && userData.user.userId),
      username: userData.username || userData.userName || (userData.user && userData.user.name),
      name: userData.userName || userData.name || (userData.user && userData.user.name),
      email: userData.email || (userData.user && userData.user.email),
      role: userData.role || (userData.user && userData.user.role),
      isSocialLogin: !userData.userId && (userData.username || userData.email), // 소셜로그인 여부 판단
      originalData: userData // 원본 데이터 보존
    };

    console.log('정규화 후 사용자 데이터:', normalizedUser);
    return normalizedUser;
  };

  const handleLogout = () => {
    setUser(null);
  };

  // 사용자 상태 업데이트 함수
  const updateUserState = async () => {
    try {
      const res = await api.get('/api/users/check-session');
      console.log('사용자 정보 업데이트:', res.data);

      const normalizedUser = normalizeUserData(res.data);
      setUser(normalizedUser);

      if (normalizedUser && normalizedUser.role) {
        window.userRole = normalizedUser.role;
        console.log('사용자 역할 업데이트:', normalizedUser.role);
      }
    } catch (e) {
      console.log('사용자 정보 업데이트 실패:', e);
      setUser(null);
      window.userRole = null;
    }
  };
  // 🔹 로딩 중이면 화면 표시 안함
  if (loading) {
    return <div>로딩중...</div>; // 원하면 스피너 컴포넌트로 교체 가능
  }


  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route path='/' element={<Main user={user} />} />
        <Route path="/signup" element={<SignUpPage user={user} />} />
        <Route path="/login" element={<LoginPage user={user} onLoginSuccess={updateUserState} />} />
        <Route path="/pet/register" element={<MyPetPage user={user} />} />
        <Route path="/pet/edit/:petId" element={<MyPetEditPage user={user} />} />
        <Route path="/pet/profile/:petId" element={<MyPetProfile user={user} />} />
        <Route path="/main" element={<Main user={user} />} />
        <Route path="/abandoned/register" element={<AbandonedPetPage user={user} />} />
        <Route path="/admin/abandoned-pets" element={<AdminAbandonedPets user={user} />} />
        <Route path="/adopt" element={<AdoptList user={user} />} />
        <Route path="/admin/adopt-applications" element={<AdoptApplications user={user} />} />
        <Route path="/community" element={<CommunityPage user={user} />} />
        <Route path="/community/createPost" element={<CommunityPost user={user} />} />
        <Route path="/community/posts" element={<CommunityGet user={user} />} />
        <Route path="/community/:postId" element={<CommunityDetail user={user} />} />
        <Route path="/community/:postId/edit" element={<CommunityEdit user={user} />} />
        <Route path="/mypage" element={<MyPage user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
