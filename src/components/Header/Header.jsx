import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

function Header({ user, onLogout }) {
    const navigate = useNavigate();
    // 사용자 정보 가져오기 (Main과 동일한 방식)

    const handleLogout = async () => {
        try {
            await axios.post('/api/users/logout', {}, { withCredentials: true });
            alert('로그아웃 되었습니다.');
            if (onLogout) {
                onLogout(); // 부모 상태 업데이트
            }
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <h1 className="main-title" onClick={() => navigate('/main')}>
                    🐾 Pawnder
                </h1>
                <div className="user-info">
                    {user && user.username ? (
                        <>
                            <span className="welcome-text">
                                안녕하세요, {user.username}님!
                            </span>
                            <button onClick={handleLogout} className="logout-btn">
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/login')} className="login-btn">
                            로그인
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
