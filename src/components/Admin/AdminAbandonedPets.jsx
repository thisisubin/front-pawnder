import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminAbandonedPets.css';

function AdminAbandonedPets({ user }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    //

    useEffect(() => {
        console.log('useEffect 실행됨');
        const fetchPets = async () => {
            try {
                console.log('fetchPets 함수 시작');
                const response = await axios.get('/api/admin/abandoned-pets', { withCredentials: true });
                console.log("응답 데이터:", response.data); // 👈 로그 확인

                // 각 유기견의 상태 정보 상세 로그
                if (response.data && Array.isArray(response.data)) {
                    console.log('배열 데이터 확인됨, 길이:', response.data.length);
                    response.data.forEach((pet, index) => {
                        console.log(`유기견 ${index + 1}:`, {
                            id: pet.id,
                            status: pet.status,
                            reportStatus: pet.reportStatus,
                            description: pet.description?.substring(0, 30) + '...'
                        });
                    });
                } else {
                    console.log('응답 데이터가 배열이 아님:', typeof response.data);
                }

                setPets(response.data);
                console.log('pets 상태 설정됨:', response.data);
                setLoading(false);
            } catch (error) {
                console.error('유기동물 데이터를 불러오지 못했습니다.', error);
                setError('데이터를 불러오지 못했습니다.');
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    const openModalWithPet = (pet) => {
        setSelectedPet(pet);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPet(null);
    };


    const getStatusLabel = (pet) => {
        console.log('getStatusLabel 호출됨:', pet);
        console.log('pet.status:', pet.status);
        console.log('pet.reportStatus:', pet.reportStatus);

        // reportStatus가 있다면 사용, 없다면 status 필드 사용
        if (pet.reportStatus && pet.reportStatus !== 'undefined') {
            console.log('reportStatus 사용:', pet.reportStatus);
            switch (pet.reportStatus) {
                case 'APPROVED':
                    return <span className="approved-status">승인됨</span>;
                case 'PENDING':
                    return <span className="pending-status">대기중</span>;
                case 'REJECTED':
                    return <span className="rejected-status">거절됨</span>;
                default:
                    return <span className="unknown-status">알 수 없음</span>;
            }
        }

        // status 필드를 기반으로 제보 상태 매핑
        console.log('status 필드 사용:', pet.status);
        switch (pet.status) {
            case 'LOST':
                return <span className="pending-status">대기중</span>;
            case 'PROTECTING':
                return <span className="approved-status">승인됨</span>;
            case 'WAITING':
                return <span className="approved-status">승인됨</span>;
            case 'ADOPT':
                return <span className="approved-status">승인됨</span>;
            default:
                console.log('기본값 반환: 대기중');
                return <span className="pending-status">대기중</span>;
        }
    };




    // 카카오 지도 스크립트 삽입
    useEffect(() => {
        if (isModalOpen && selectedPet) {
            const script = document.createElement('script');
            script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=0002645a847652028848c550afe30640&autoload=false';
            script.onload = () => {
                window.kakao.maps.load(() => {
                    const container = document.getElementById('map');
                    const options = {
                        center: new window.kakao.maps.LatLng(selectedPet.latitude, selectedPet.longitude),
                        level: 3,
                    };
                    const map = new window.kakao.maps.Map(container, options);


                    new window.kakao.maps.Marker({
                        map,
                        position: new window.kakao.maps.LatLng(selectedPet.latitude, selectedPet.longitude),
                    });
                });
            };
            document.head.appendChild(script);
        }
    }, [isModalOpen, selectedPet]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>관리자 데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error">
                <div className="error-icon">⚠️</div>
                <h3>오류가 발생했습니다</h3>
                <p>{error}</p>
            </div>
        );
    }


    return (
        <div className="admin-container">
            <main className="admin-content">
                <section className="admin-header-section">
                    <h2>📋 유기견 제보 리스트</h2>
                    <p>사용자들이 제보한 유기견 정보를 관리하세요</p>
                </section>

                <section className="admin-table-section">
                    <div className="table-container">
                        {console.log('테이블 섹션 렌더링, pets:', pets)}
                        {console.log('pets 길이:', pets?.length)}
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>발견 날짜</th>
                                    <th>발견 시간</th>
                                    <th>위치</th>
                                    <th>제보 내용</th>
                                    <th>관리 상태</th>
                                
                                </tr>
                            </thead>
                            <tbody>
                                {pets.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="no-data">
                                            <div className="no-data-content">
                                                <div className="no-data-icon">📭</div>
                                                <h4>등록된 제보가 없습니다</h4>
                                                <p>아직 사용자가 제보한 유기견이 없습니다.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pets.map((pet) => {
                                        console.log('테이블 행 렌더링:', pet);
                                        const statusLabel = getStatusLabel(pet);
                                        console.log('생성된 상태 라벨:', statusLabel);

                                        return (
                                            <tr key={pet.id} className="table-row">
                                                <td className="pet-id">#{pet.id}</td>
                                                <td className="pet-date">{pet.foundDate}</td>
                                                <td className="pet-time">{pet.foundTime}</td>
                                                <td className="pet-location">{pet.location}</td>
                                                <td className="pet-description">
                                                    {pet.description?.length > 50
                                                        ? `${pet.description.substring(0, 50)}...`
                                                        : pet.description}
                                                </td>
                                                
                                                <td className="pet-actions">
                                                    <button
                                                        onClick={() => openModalWithPet(pet)}
                                                        className="view-btn"
                                                    >
                                                        상세보기
                                                    </button>
                                                </td>
                                                
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {isModalOpen && selectedPet && (() => {
                const { id, foundDate, foundTime, location, description, type, imageUrl } = selectedPet;
                const isApproved = selectedPet.status === 'PROTECTING' || selectedPet.status === 'WAITING' || selectedPet.status === 'ADOPT';

                const handleApproval = async (id) => {
                    try {
                        await axios.post(`/api/admin/reports/${id}/register`, {}, { withCredentials: true });

                        // 등록 성공 후 pets 상태 갱신
                        setPets(prev =>
                            prev.map(pet =>
                                pet.id === id ? { ...pet, status: 'PROTECTING' } : pet
                            )
                        );
                        alert('유기동물 등록이 완료되었습니다.');
                        closeModal();
                    } catch (error) {
                        console.error('유기동물 등록을 실패했습니다.', error);
                        if (error.response && error.response.data && error.response.data.message) {
                            alert(`등록 실패: ${error.response.data.message}`);
                        } else {
                            alert('유기동물 등록 중 오류가 발생했습니다.');
                        }
                    }
                };

                return (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>제보 상세 정보 #{id}</h3>
                                <button className="modal-close-btn" onClick={closeModal}>×</button>
                            </div>

                            <div className="modal-photo-section">
                                <h4>📸 제보 사진</h4>
                                {imageUrl ? (
                                    <img src={imageUrl} alt="제보 이미지" className="modal-main-image" />
                                ) : (
                                    <div className="no-image">사진 없음</div>
                                )}
                            </div>

                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <span className="info-label"> 발견 날짜</span>
                                    <span className="info-value">{foundDate || '정보 없음'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"> 발견 시각</span>
                                    <span className="info-value">{foundTime || '정보 없음'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"> 발견 지역</span>
                                    <span className="info-value">{location || '정보 없음'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"> 추측 품종</span>
                                    <span className="info-value">{type || '정보 없음'}</span>
                                </div>
                            </div>

                            <div className="modal-description-section">
                                <h4>📝 제보 내용</h4>
                                <div className="description-content">
                                    {description || '제보 내용이 없습니다.'}
                                </div>
                            </div>

                            <div id="map" style={{ width: '100%', height: '300px', marginBottom: '20px' }}></div>

                            <div className="modal-actions">
                                {isApproved ? (
                                    <button disabled className="approved-button">
                                        이미 등록됨
                                    </button>
                                ) : (
                                    <button onClick={() => handleApproval(id)} className="approve-button">
                                        유기동물 등록
                                    </button>
                                )}
                                <button onClick={closeModal} className="close-button">닫기</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default AdminAbandonedPets;