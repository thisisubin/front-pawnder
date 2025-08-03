import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/Header';
import './AdoptList.css';

function AdoptList() {
    const [pets, setPets] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applyingPetId, setApplyingPetId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
        fetchPets();
    }, []);

    const fetchUserData = async () => {
        try {
            const userResponse = await axios.get('/api/users/check-session', {
                withCredentials: true
            });
            setUser(userResponse.data);
        } catch (error) {
            console.error('사용자 정보 로딩 실패:', error);
        }
    };

    const fetchPets = async () => {
        try {
            const response = await axios.get('/api/abandoned/abandoned-pets', {
                withCredentials: true
            });
            setPets(response.data || []);
        } catch (error) {
            console.error('유기견 목록 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdoptApply = async (petId) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (window.confirm('정말로 이 유기견을 입양 신청하시겠습니까?')) {
            alert(`전달되는 petId: ${petId}`);  // ✅ 여기에 추가
            setApplyingPetId(petId);
            try {
                const response = await axios.post(`/api/adopt/apply/${petId}`, {}, {
                    withCredentials: true
                });
                alert('입양 신청이 완료되었습니다!');
                fetchPets(); // 목록 새로고침
            } catch (error) {
                console.error('입양 신청 실패:', error);
                if (error.response?.status === 409) {
                    alert('이미 신청한 유기견입니다.');
                } else {
                    alert('입양 신청 중 오류가 발생했습니다.');
                }
            } finally {
                setApplyingPetId(null);
            }
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PROTECTING':
                return '보호중';
            case 'WAITING':
                return '입양 대기중';
            case 'ADOPT':
                return '입양 완료';
            default:
                return '알 수 없음';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PROTECTING':
                return '#4ecdc4';
            case 'WAITING':
                return '#ff6b6b';
            case 'ADOPT':
                return '#28a745';
            default:
                return '#6c757d';
        }
    };

    if (loading) {
        return (
            <>
                <Header user={user} />
                <div className="adopt-loading">
                    <div className="loading-spinner"></div>
                    <p>유기견 목록을 불러오는 중...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header user={user} />
            <div className="adopt-container">
                <div className="adopt-header">
                    <h1>🐕 유기견 입양</h1>
                    <p>소중한 생명을 구해주세요. 함께 따뜻한 가정을 만들어보세요.</p>
                </div>

                {pets.length === 0 ? (
                    <div className="no-pets">
                        <div className="no-pets-icon">🐾</div>
                        <h2>등록된 유기견이 없습니다</h2>
                        <p>현재 보호중인 유기견이 없습니다.</p>
                    </div>
                ) : (
                    <div className="pets-grid">
                        {pets.map((pet) => (
                            <div key={pet.id} className="pet-card">
                                <div className="pet-image">
                                    {pet.imageUrl ? (
                                        <img
                                            src={pet.imageUrl}
                                            alt={pet.name}
                                            className="pet-detail-image"
                                            id={`pet-image-${pet.id}`}
                                        />
                                    ) : (
                                        <div className="pet-no-image">
                                            <span>🐕</span>
                                        </div>
                                    )}
                                    <div
                                        className="pet-status"
                                        style={{ backgroundColor: getStatusColor(pet.status) }}
                                    >
                                        {getStatusText(pet.status)}
                                    </div>
                                </div>

                                <div className="pet-info">
                                    <h3 className="pet-name">{pet.name}</h3>
                                    <div className="pet-details">
                                        <p><strong>품종:</strong> {pet.type}</p>
                                        <p><strong>나이:</strong> {pet.age}살</p>
                                        <p><strong>성별:</strong> {pet.gender === 'MALE' ? '수컷' : '암컷'}</p>
                                        <p><strong>발견장소:</strong> {pet.location}</p>
                                        <p><strong>발견일:</strong> {new Date(pet.foundDate).toLocaleDateString('ko-KR')}</p>
                                    </div>

                                    <div className="pet-description">
                                        <p>{pet.description}</p>
                                    </div>
                                </div>

                                <div className="pet-actions">
                                    {pet.status === 'PROTECTING' ? (
                                        <button
                                            className="adopt-btn"
                                            onClick={() => handleAdoptApply(pet.id)}
                                            disabled={applyingPetId === pet.id}
                                        >
                                            {applyingPetId === pet.id ? '신청 중...' : '입양 신청'}
                                        </button>
                                    ) : pet.status === 'WAITING' ? (
                                        <button className="waiting-btn" disabled>
                                            입양 대기중
                                        </button>
                                    ) : (
                                        <button className="adopted-btn" disabled>
                                            입양 완료
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default AdoptList; 