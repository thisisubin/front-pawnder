import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import NotificationButton from '../NotificationButton';
import './Header.css';

function Header({ user, onLogout }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 디버깅을 위한 로그
    console.log('=== Header 컴포넌트 ===');
    console.log('받은 user prop:', user);
    console.log('user.loggedIn:', user?.loggedIn);
    console.log('user.name:', user?.name);
    console.log('user.username:', user?.username);

    const handleLogout = async () => {
        try {
            await api.post('/api/users/logout', {});
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

    const toggleMenu = () => {
        console.log('토글 버튼 클릭됨, 현재 상태:', isMenuOpen);
        setIsMenuOpen(!isMenuOpen);
        console.log('새로운 상태:', !isMenuOpen);
    };

    const handleMenuClick = (path) => {
        navigate(path);
        setIsMenuOpen(false); // 메뉴 클릭 시 토글 닫기
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <h1 className="main-title" onClick={() => navigate('/')}>
                    🐾 Pawnder
                </h1>

                {/* 데스크톱 메뉴 */}
                <nav className="desktop-menu">
                    <button
                        className="menu-btn"
                        onClick={() => handleMenuClick('/pet/register')}
                    >
                        반려견 등록
                    </button>
                    <button
                        className="menu-btn"
                        onClick={() => handleMenuClick('/abandoned/register')}
                    >
                        유기견 제보
                    </button>
                    <button
                        className="menu-btn"
                        onClick={() => handleMenuClick('/adopt')}
                    >
                        유기견 후원
                    </button>
                    <button
                        className="menu-btn"
                        onClick={() => handleMenuClick('/community')}
                    >
                        커뮤니티
                    </button>
                    {user && user.loggedIn && user.role !== 'ADMIN' && (
                        <button
                            className="menu-btn"
                            onClick={() => handleMenuClick('/mypage')}
                        >
                            마이페이지
                        </button>
                    )}
                </nav>

                <div className="user-info">
                    {user && user.loggedIn ? (
                        <>
                            <span className="welcome-text">
                                안녕하세요, {user.name || user.username}님!
                                {user.isSocialLogin && <span className="social-badge">소셜</span>}
                            </span>
                            <NotificationButton userId={user.userId} />
                            <button onClick={handleLogout} className="logout-btn">
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <button onClick={() => navigate('/login')} className="login-btn">
                                로그인
                            </button>
                            <button onClick={() => navigate('/signup')} className="signup-btn">
                                회원가입
                            </button>
                        </div>
                    )}
                </div>

                {/* 모바일 햄버거 메뉴 버튼 */}
                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
                </button>
            </div>

            {/* 모바일 메뉴 */}
            <nav className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <button
                    className="mobile-menu-btn"
                    onClick={() => handleMenuClick('/pet/register')}
                >
                    반려견 등록
                </button>
                <button
                    className="mobile-menu-btn"
                    onClick={() => handleMenuClick('/abandoned/register')}
                >
                    유기견 제보
                </button>
                <button
                    className="mobile-menu-btn"
                    onClick={() => handleMenuClick('/adopt')}
                >
                    유기견 후원
                </button>
                <button
                    className="mobile-menu-btn"
                    onClick={() => handleMenuClick('/community')}
                >
                    커뮤니티
                </button>
                {user && user.loggedIn && user.role !== 'ADMIN' && (
                    <button
                        className="mobile-menu-btn"
                        onClick={() => handleMenuClick('/mypage')}
                    >
                        마이페이지
                    </button>
                )}
            </nav>
        </header>
    );
}

export default Header;
