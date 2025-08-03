import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import './Main.css';

function Main() {
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 사용자 정보와 반려견 정보 가져오기
        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get('/api/users/check-session', { withCredentials: true });
                setUser(userResponse.data);

                const petsResponse = await axios.get('/api/pet/profile/pets', { withCredentials: true });
                setPets(petsResponse.data);
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
                if (error.response?.status === 401) {
                    alert('로그인이 필요합니다.');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        setUser(null);
    };

    if (loading) {
        return (
            <div className="main-loading">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="main-container">
            <Header user={user} onLogout={handleLogout} />

            <main className="main-content">
                <section className="welcome-section">
                    <h2>반려견과 함께하는 따뜻한 커뮤니티</h2>
                    <p>Pawnder에서 소중한 인연을 만들어보세요</p>
                </section>

                <section className="pets-section">
                    <div className="section-header">
                        <h3>반려견</h3>
                        <button
                            onClick={() => navigate('/mypet/register')}
                            className="add-pet-btn"
                        >
                            반려견 추가
                        </button>
                    </div>

                    {pets.length === 0 ? (
                        <div className="no-pets">
                            <p>등록된 반려견이 없습니다.</p>
                            <button
                                onClick={() => navigate('/mypet/register')}
                                className="add-pet-btn-large"
                            >
                                첫 반려견 등록하기
                            </button>
                        </div>
                    ) : (
                        <div className="pets-grid">
                            {pets.map((pet) => (
                                <div key={pet.petId} className="pet-card" onClick={() => navigate(`/pet/profile/${pet.petId}`)}>
                                    <div className="pet-avatar">
                                        {pet.profile ? (
                                            <img src={pet.profile} alt={pet.name} />
                                        ) : (
                                            <div className="pet-avatar-placeholder">🐕</div>
                                        )}
                                    </div>
                                    <div className="pet-info">
                                        <h4>{pet.name}</h4>
                                        <p>{pet.adopt}</p>
                                        <p className="pet-age">{pet.age}살</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="features-section">
                    <div className="features-grid">
                        <div className="feature-card" onClick={() => navigate('/adopt')}>
                            <div className="feature-icon">🐕</div>
                            <h4>유기견 목록</h4>
                            <p>유기견 정보를 확인하고 </p>
                            <p>입양을 생각해보세요</p>
                        </div>
                        <div className="feature-card" onClick={() => navigate('/community')}>
                            <div className="feature-icon">👥</div>
                            <h4>커뮤니티</h4>
                            <p>다른 반려인들과 소통하고</p>
                            <p>정보를 공유해보세요</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h4>일정 관리</h4>
                            <p>반려견의 건강관리 일정을</p>
                            <p>체계적으로 관리하세요</p>
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <div className="features-grid">
                        {user?.username === 'admin' ? (
                            <>
                                <div className="feature-card" onClick={() => navigate('/admin/abandoned-pets')}>
                                    <div className="feature-icon">📋</div>
                                    <h4>유기견 제보 리스트</h4>
                                    <p>등록된 유기견 제보를 확인하세요.</p>
                                    <p>유저가 등록한 유기견 목록중에 LOST 상태만 보임</p>
                                </div>
                                <div className="feature-card" onClick={() => navigate('/admin/adopt-applications')}>
                                    <div className="feature-icon">📝</div>
                                    <h4>입양 신청 관리</h4>
                                    <p>사용자들의 입양 신청을 관리하세요.</p>
                                    <p>입양 신청 승인/거절 처리</p>
                                </div>
                            </>
                        ) : (
                            <div className="feature-card" onClick={() => navigate('/abandoned/register')}>
                                <div className="feature-icon">🚨</div>
                                <h4>유기견 제보</h4>
                                <p>유기견을 발견하셨다면, 신고해주세요!</p>
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}

export default Main;