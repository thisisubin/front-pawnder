import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const sessionChecked = useRef(false); // ✅ 중복 방지용 ref

    // ✅ 로그인 여부 확인 (세션 기반)
    useEffect(() => {
        if (!sessionChecked.current) {
            axios.get('/api/users/check-session', { withCredentials: true })
                .then(res => {
                    setIsLoggedIn(res.data.loggedIn === true);
                    sessionChecked.current = true; // ✅ 이미 체크한 표시
                })
                .catch(err => {
                    console.error('세션 확인 실패:', err);
                    setIsLoggedIn(false);
                    sessionChecked.current = true;
                });
        }
    }, []);

    // ✅ 로그아웃 처리
    const handleLogout = async () => {
        try {
            await axios.post('/api/users/logout', {}, { withCredentials: true });
            setIsLoggedIn(false);
            alert('로그아웃 되었습니다.');
            navigate('/');
        } catch (err) {
            console.error('로그아웃 실패:', err);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.10)',
                padding: '48px 36px 36px 36px',
                minWidth: '340px',
                maxWidth: '90vw',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🐾</div>
                <h1 style={{
                    fontSize: '2.3rem',
                    fontWeight: 700,
                    margin: '0 0 12px 0',
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Pawnder에 오신 것을 환영합니다!
                </h1>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '32px' }}>
                    유기견과 함께하는 따뜻한 커뮤니티, Pawnder에서 소중한 인연을 만들어보세요.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    {isLoggedIn ? (
                        <>
                            <Link to="/mypet/profile" style={{
                                background: 'linear-gradient(45deg, #4ecdc4, #45b7d1)',
                                color: 'white',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                textDecoration: 'none',
                                boxShadow: '0 4px 12px rgba(78,205,196,0.10)',
                            }}>반려견 프로필</Link>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                    color: 'white',
                                    padding: '14px 32px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    textDecoration: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(255,107,107,0.10)',
                                }}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" style={{
                                background: 'linear-gradient(45deg, #4ecdc4, #45b7d1)',
                                color: 'white',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                textDecoration: 'none',
                                boxShadow: '0 4px 12px rgba(78,205,196,0.10)',
                            }}>회원가입</Link>
                            <Link to="/login" style={{
                                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                color: 'white',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                textDecoration: 'none',
                                boxShadow: '0 4px 12px rgba(255,107,107,0.10)',
                            }}>로그인</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
