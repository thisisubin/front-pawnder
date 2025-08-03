import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminAbandonedPets.css';
import Header from "../Header/Header";

function AdminAbandonedPets() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    //

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await axios.get('/api/admin/abandoned-pets', { withCredentials: true });
                console.log("응답 데이터:", response.data); // 👈 로그 확인
                setPets(response.data);
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


    const getStatusLabel = (status) => {
        switch (status) {
            case 'PROTECTING':
                return <span className="approved-status">등록됨</span>;
            case 'LOST':
                return <span className="pending-status">대기중</span>;
            case 'WAITING':
                return <span className="waiting-status">입양대기중</span>;
            case 'ADOPT':
                return <sapn className="adopted-status">입양됨</sapn>;
            default:
                return <span className="unknown-status">알 수 없음</span>;
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

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;


    return (
        <div className="admin-pets-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 유기동물 제보 리스트</h2>

            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>발견된 날짜</th>
                        <th>발견된 시각</th>
                        <th>위치</th>
                        <th>제보내용</th>
                        <th>등록상태</th>
                        <th>상세정보</th>
                    </tr>
                </thead>
                <tbody>
                    {pets.map((pet) => (
                        <tr key={pet.id}>
                            <td>{pet.id}</td>
                            <td>{pet.foundDate}</td>
                            <td>{pet.foundTime}</td>
                            <td>{pet.location}</td>
                            <td>{pet.description}</td>
                            <td>{getStatusLabel(pet.status)}</td>

                            <td>
                                <button onClick={() => openModalWithPet(pet)}>보기</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && selectedPet && (() => {
                const { id, foundDate, foundTime, location, description, type, imageUrl } = selectedPet;
                const isApproved = selectedPet.status === 'PROTECTING';

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

                            <h3>#{id} 📍 제보 위치</h3>
                            <div id="map" style={{ width: '100%', height: '300px' }}></div>
                            <h4> 제보 사진 <img src={imageUrl} alt="제보 이미지" width="100" /></h4>
                            <h4> 발견 날짜 : {foundDate}</h4>
                            <h4> 발견 시각 : {foundTime}</h4>
                            <h4> 발견 지역 : {location}</h4>
                            <h4> 제보 내용 : {description}</h4>
                            <h4> 추측 품종 : {type}</h4>
                            {isApproved ? (
                                <button disabled className="approved-button">등록됨</button>
                            ) : (
                                <button onClick={() => handleApproval(id)} className="approve-button">유기동물 등록</button>
                            )}


                            <button onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default AdminAbandonedPets;