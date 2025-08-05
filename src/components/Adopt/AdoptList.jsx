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
    const [donatingPetId, setDonatingPetId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 아임포트 스크립트 동적 로드
        const loadIamportScript = () => {
            return new Promise((resolve, reject) => {
                // 이미 로드되어 있는지 확인
                if (window.IMP) {
                    resolve();
                    return;
                }

                const script = document.createElement("script");
                script.src = "https://cdn.iamport.kr/js/iamport.payment-1.1.8.js";
                script.async = true;

                script.onload = () => {
                    console.log('아임포트 스크립트 로드 완료');
                    resolve();
                };

                script.onerror = () => {
                    console.error('아임포트 스크립트 로드 실패');
                    reject(new Error('아임포트 스크립트 로드 실패'));
                };

                document.head.appendChild(script);
            });
        };

        // 스크립트 로드 후 데이터 가져오기
        loadIamportScript()
            .then(() => {
                fetchUserData();
                fetchPets();
            })
            .catch((error) => {
                console.error('스크립트 로드 실패:', error);
                // 스크립트 로드 실패해도 기본 기능은 동작하도록
                fetchUserData();
                fetchPets();
            });
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
            alert(`전달되는 petId: ${petId}`);
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

    const handleDonation = async (petId) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // IMP 객체가 로드되었는지 확인
        console.log('IMP 객체 확인:', window.IMP);
        if (typeof window.IMP === 'undefined') {
            console.error('IMP 객체가 로드되지 않았습니다.');
            alert('결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const amount = prompt('후원 금액을 입력해주세요 (원):');
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('올바른 금액을 입력해주세요.');
            return;
        }

        if (window.confirm(`${amount}원을 후원하시겠습니까?`)) {
            try {
                console.log('아임포트 초기화 시작');
                window.IMP.init('imp35834577'); // ⚠️ 여기에 고객사 식별코드 넣기!
                console.log('아임포트 초기화 완료');

                setDonatingPetId(petId);

                // 아임포트 결제 요청
                const paymentData = {
                    pg: 'html5_inicis', // 결제 PG
                    pay_method: 'card', // 결제수단
                    merchant_uid: `donation_${Date.now()}`, // 주문번호
                    amount: parseInt(amount), // 결제금액
                    name: 'Pawnder 유기견 후원', // 주문명
                    buyer_email: user.email || 'user@example.com', // 구매자 이메일
                    buyer_name: user.name || user.username || '후원자', // 구매자 이름
                };

                console.log('결제 요청 데이터:', paymentData);

                window.IMP.request_pay(paymentData, function (rsp) {
                    console.log('결제 응답:', rsp);
                    if (rsp.success) {
                        // 결제 성공 시 백엔드에 imp_uid 전달
                        const formData = new FormData();
                        formData.append('impUid', rsp.imp_uid);
                        formData.append('merchantUid', rsp.merchant_uid);
                        formData.append('amount', amount.toString());
                        formData.append('userName', user.name || user.username || '후원자');
                        formData.append('paymentMethod', rsp.pay_method);
                        formData.append('abandonedPetId', petId.toString());

                        axios.post(`/api/abandoned/donation/${rsp.imp_uid}`, formData, {
                            withCredentials: true,

                        }).then(() => {
                            alert('후원이 완료되었습니다! 감사합니다.');
                        }).catch((error) => {
                            console.error('후원 처리 실패:', error);
                            alert('후원 처리 중 오류가 발생했습니다.');
                        }).finally(() => {
                            setDonatingPetId(null);
                        });
                    } else {
                        // 결제 실패
                        console.error('결제 실패:', rsp.error_msg);
                        alert(`결제에 실패하였습니다. ${rsp.error_msg}`);
                        setDonatingPetId(null);
                    }
                });
            } catch (error) {
                console.error('결제 요청 실패:', error);
                alert('결제 요청 중 오류가 발생했습니다.');
                setDonatingPetId(null);
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
                                        <p><strong>성별:</strong> {pet.gender === 'MALE' ? '수컷' : '암컷'}</p>
                                        <p><strong>발견장소:</strong> {pet.location}</p>
                                        <p><strong>발견일:</strong> {new Date(pet.foundDate).toLocaleDateString('ko-KR')}</p>
                                    </div>

                                    <div className="pet-description">
                                        <p>{pet.description}</p>
                                    </div>
                                </div>

                                <div className="pet-actions">
                                    <button
                                        className="donation-btn"
                                        onClick={() => handleDonation(pet.id)}
                                        disabled={donatingPetId === pet.id}
                                    >
                                        {donatingPetId === pet.id ? '처리중...' : '💝 후원하기'}
                                    </button>

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