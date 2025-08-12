import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyPage.css';

function MyPage({ user }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 사용자 정보 상태
    const [userInfo, setUserInfo] = useState({
        name: '',
        userId: '',
        email: '',
        birth: '',
        phoneNm: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    // 나의 반려견 상태
    const [myPets, setMyPets] = useState([]);

    // 나의 입양 신청 상태  
    const [myAdoptions, setMyAdoptions] = useState([]);

    // 나의 후원 상태
    const [mySponsors, setMySponsors] = useState([]);
    const [selectedSponsor, setSelectedSponsor] = useState(null);
    const [showSponsorModal, setShowSponsorModal] = useState(false);

    // 컴포넌트 마운트 시 사용자 정보 로드
    useEffect(() => {
        loadUserInfo();
    }, []);

    // 탭 변경 시 해당 데이터 로드
    useEffect(() => {
        switch (activeTab) {
            case 'pets':
                loadMyPets();
                break;
            case 'adoptions':
                loadMyAdoptions();
                break;
            case 'sponsors':
                loadMySponsors();
                break;
            default:
                break;
        }
    }, [activeTab]);

    // 사용자 정보 로드 (기존 check-session API 활용)
    const loadUserInfo = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/users/check-session', {
                withCredentials: true
            });

            // user prop으로 받은 데이터 우선 사용, 없으면 API 응답 사용
            const userData = user && user.loggedIn ? response.data : user;
            const userProfile = {
                name: userData.name || '사용자',
                userId: userData.userId || userData.username || '',
                email: userData.email || '',
                birth: userData.birth || '',
                phoneNm: userData.phoneNm || ''
            };

            console.log('받은 사용자 데이터:', userData);
            console.log('변환된 프로필:', userProfile);

            setUserInfo(userProfile);
            setEditForm(userProfile);
        } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
            setError('사용자 정보를 불러올 수 없습니다.');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // 나의 반려견 로드
    const loadMyPets = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/pet/profile/pets', {
                withCredentials: true
            });
            setMyPets(response.data);
        } catch (error) {
            console.error('반려견 정보 로드 실패:', error);
            setError('반려견 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 나의 입양 신청 로드 (API 미구현으로 임시 처리)
    const loadMyAdoptions = async () => {
        setLoading(true);
        setError('');
        try {
            // TODO: 백엔드에서 입양 신청 내역 API 구현 필요
            const response = await axios.get('/api/adopt/adoption/my-applications', {
                 withCredentials: true
             });
            setMyAdoptions(response.data);
        } catch (error) {
            console.error('입양 신청 내역 로드 실패:', error);
            setError('입양 신청 내역을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 나의 후원 내역 로드 (API 미구현으로 임시 처리)
    const loadMySponsors = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/abandoned/donation/my-donations', {
                withCredentials: true
            });
            setMySponsors(response.data);
        } catch (error) {
            console.error('후원 내역 로드 실패:', error);
            setError('후원 내역을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 사용자 정보 수정 (API 미구현으로 임시 처리)
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // TODO: 백엔드에서 사용자 정보 수정 API 구현 필요
            // const response = await axios.put('/api/users/profile', editForm, {
            //     withCredentials: true
            // });
            // setUserInfo(response.data);

            // 임시로 클라이언트에서만 상태 업데이트
            setUserInfo(editForm);
            setIsEditing(false);
            alert('정보가 임시로 수정되었습니다. (실제 저장을 위해서는 백엔드 API가 필요합니다)');
            console.log('사용자 정보 수정 API가 구현되지 않았습니다.');
        } catch (error) {
            console.error('정보 수정 실패:', error);
            setError('정보 수정에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 입력 값 변경 핸들러
    const handleInputChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    // 후원 상세 정보 모달 열기
    const openSponsorModal = (sponsor) => {
        setSelectedSponsor(sponsor);
        setShowSponsorModal(true);
    };

    // 후원 상세 정보 모달 닫기
    const closeSponsorModal = () => {
        setSelectedSponsor(null);
        setShowSponsorModal(false);
    };

    return (
        <div className="mypage mypage-container">
            <div className="mypage-header">
                <h2>마이페이지</h2>
                <p>{userInfo.name}님, 안녕하세요! 🐾</p>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        내 정보
                    </button>
                    <button
                        className={`tab ${activeTab === 'pets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pets')}
                    >
                        나의 반려견
                    </button>
                    <button
                        className={`tab ${activeTab === 'adoptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('adoptions')}
                    >
                        입양 신청
                    </button>
                    <button
                        className={`tab ${activeTab === 'sponsors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sponsors')}
                    >
                        후원 내역
                    </button>
                </div>

                <div className="tab-content">
                    {loading && <div className="loading">로딩중...</div>}
                    {error && <div className="error-message">{error}</div>}

                    {!loading && !error && (
                        <>
                            {activeTab === 'profile' && (
                                <div className="profile-section">
                                    <div className="section-header">
                                        <h3>내 정보</h3>
                                        {!isEditing && (
                                            <button
                                                className="edit-btn"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                수정하기
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleEditSubmit} className="edit-form">

                                            <div className="form-group">
                                                <label htmlFor="email">이메일</label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={editForm.email || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="birth">생년월일</label>
                                                <input
                                                    id="birth"
                                                    name="birth"
                                                    type="date"
                                                    value={editForm.birth || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="phoneNm">전화번호</label>
                                                <input
                                                    id="phoneNm"
                                                    name="phoneNm"
                                                    type="tel"
                                                    value={editForm.phoneNm || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-actions">
                                                <button type="submit" className="save-btn" disabled={loading}>
                                                    {loading ? '저장중...' : '저장'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cancel-btn"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditForm(userInfo);
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="profile-info">
                                            <div className="info-item">
                                                <span className="label">이름:</span>
                                                <span className="value">{userInfo.name}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">아이디:</span>
                                                <span className="value">{userInfo.userId}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">이메일:</span>
                                                <span className="value">{userInfo.email}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">생년월일:</span>
                                                <span className="value">{userInfo.birth}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">전화번호:</span>
                                                <span className="value">{userInfo.phoneNm}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'pets' && (
                                <div className="pets-section">
                                    <div className="section-header">
                                        <h3>나의 반려견</h3>
                                        <button
                                            className="add-btn"
                                            onClick={() => navigate('/pet/register')}
                                        >
                                            반려견 등록하기
                                        </button>
                                    </div>

                                    {myPets.length === 0 ? (
                                        <div className="empty-state">
                                            <p>등록된 반려견이 없습니다.</p>
                                            <button
                                                className="register-btn"
                                                onClick={() => navigate('/pet/register')}
                                            >
                                                첫 반려견 등록하기 🐕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pets-grid">
                                            {myPets.map(pet => (
                                                <div key={pet.id} className="pet-card">
                                                    {pet.imageUrl && (
                                                        <img src={pet.imageUrl} alt={pet.name} className="pet-image" />
                                                    )}
                                                    <div className="pet-info">
                                                        <h4>{pet.name}</h4>
                                                        <p>견종: {pet.breed}</p>
                                                        <p>나이: {pet.age}세</p>
                                                        <p>성별: {pet.gender === 'M' ? '남자' : '여자'}</p>
                                                        <p>등록일: {new Date(pet.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => navigate(`/pet/profile/${pet.id}`)}
                                                    >
                                                        자세히 보기
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'adoptions' && (
                                <div className="adoptions-section">
                                    <div className="section-header">
                                        <h3>나의 입양 신청</h3>
                                    </div>

                                    {myAdoptions.length === 0 ? (
                                        <div className="empty-state">
                                            <p>입양 신청 내역이 없습니다.</p>
                                            <button
                                                className="browse-btn"
                                                onClick={() => navigate('/adopt')}
                                            >
                                                입양 가능한 동물 보기 🏠
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="adoptions-list">
                                            {myAdoptions.map(adoption => (
                                                <div key={adoption.id} className="adoption-card">
                                                    <div className="adoption-info">
                                                        <h4>{adoption.petName}</h4>
                                                        <p>견종: {adoption.type}</p>
                                                        <p>신청일: {new Date(adoption.appliedAt).toLocaleDateString()}</p>
                                                        <p>상태:
                                                        <span className={`status ${adoption.adoptStatus.toLowerCase()}`}>
                                                            {adoption.adoptStatus === 'PENDING' ? '검토중' :
                                                                adoption.adoptStatus === 'APPROVED' ? '승인됨' :
                                                                    adoption.adoptStatus === 'REJECTED' ? '거절됨' : adoption.adoptStatus}
                                                        </span>
                                                        </p>
                                                        <p>발견된 지역: {adoption.location}</p>
                                                        <img
                                                src={adoption.petImageUrl}
                                                alt="유기견 사진"
                                                className="pet-image"
                                            />  
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'sponsors' && (
                                <div className="sponsors-section">
                                    <div className="section-header">
                                        <h3>나의 후원</h3>
                                    </div>

                                    {mySponsors.length === 0 ? (
                                        <div className="empty-state">
                                            <p>후원 내역이 없습니다.</p>
                                            <button
                                                className="sponsor-btn"
                                                onClick={() => navigate('/adopt')}
                                            >
                                                후원하러 가기 💝
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="sponsors-list">
                                            <div className="total-amount">
                                                <h4>총 후원 금액: {mySponsors.reduce((total, sponsor) => total + sponsor.amount, 0).toLocaleString()}원</h4>
                                            </div>
                                            {mySponsors.map(sponsor => (
                                                <div key={sponsor.abandonedPetId} className="sponsor-card">
                                                    <div className="sponsor-info">
                                                        <h4>{sponsor.type}</h4>
                                                        <p>후원 견 정보: {sponsor.petId}</p>
                                                        <p>후원 금액: {sponsor.amount.toLocaleString()}원</p>
                                                        <p>후원일: {sponsor.donatedAt}</p>
                                                    </div>
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => openSponsorModal(sponsor)}
                                                    >
                                                        자세히 보기
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 후원 상세 정보 모달 */}
            {showSponsorModal && selectedSponsor && (
                <div className="modal-overlay" onClick={closeSponsorModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>후원 상세 정보</h3>
                            <button className="modal-close" onClick={closeSponsorModal}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="sponsor-detail-info">
                                <h4>후원 견 정보</h4>
                                <div className="detail-item">
                                    <label>견종:</label>
                                    <span>{selectedSponsor.type}</span>
                                </div>
                                <div className="detail-item">
                                    <label>후원 견 ID:</label>
                                    <span>{selectedSponsor.petId}</span>
                                </div>
                                <div className="detail-item">
                                    <label>후원 금액:</label>
                                    <span className="amount">{selectedSponsor.amount.toLocaleString()}원</span>
                                </div>
                                <div className="detail-item">
                                    <label>후원일:</label>
                                    <span>{selectedSponsor.donatedAt}</span>
                                </div>
                                <div className="detail-item">
                                    <label>상태:</label>
                                    <span>{selectedSponsor.status}</span>
                                </div>

                                {/* 향후 백엔드 API 확장 시 추가할 수 있는 정보들 */}
                                <div className="additional-info">
                                    <h5>후원견 사진</h5>
                                    <img
                                                src={selectedSponsor.imageUrl}
                                                alt="유기견 사진"
                                                className="pet-image"
                                            />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn" onClick={closeSponsorModal}>
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyPage;