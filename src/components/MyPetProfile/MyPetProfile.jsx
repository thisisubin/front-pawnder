// src/components/MyPet/MyPetProfile.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import './MyPetProfile.css';

function MyPetProfile() {
    const [petProfiles, setPetProfiles] = useState([]); // 단일 객체에서 배열로 변경
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPetProfile();
    }, []);

    const fetchPetProfile = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/pet/profile/pets', {
                withCredentials: true
            });

            // 배열 형태로 데이터가 오므로 전체 배열 저장
            const pets = response.data;
            if (pets && pets.length > 0) {
                setPetProfiles(pets); // 전체 배열 저장
            } else {
                setPetProfiles([]); // 등록된 반려견이 없음
            }
        } catch (error) {
            console.error("프로필 조회 실패:", error);
            setError("프로필을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "등록되지 않음";
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    };

    const getGenderText = (gender) => {
        switch (gender) {
            case 'FEMALE': return '암컷';
            case 'MALE': return '수컷';
            case 'NEUTER': return '중성';
            default: return '알 수 없음';
        }
    };

    const getSizeText = (size) => {
        switch (size) {
            case 'SMALL': return '소형견';
            case 'MEDIUM': return '중형견';
            case 'LARGE': return '대형견';
            default: return '알 수 없음';
        }
    };

    const getAdoptText = (adopt) => {
        return adopt ? '입양견' : '일반견';
    };

    // 개별 펫 프로필 카드 컴포넌트
    const PetProfileCard = ({ petProfile, index }) => (
        <div className="pet-profile-card" key={petProfile.petId}>
            <div className="pet-card-header">
                <h3>{petProfile.name}</h3>
                <span className="pet-number">#{index + 1}</span>
            </div>

            <div className="pet-profile-content">
                <div className="pet-profile-image-section">
                    {petProfile.profile ? (
                        <img
                            src={petProfile.profile}
                            alt={`${petProfile.name}의 프로필 사진`}
                            className="pet-profile-image"
                        />
                    ) : (
                        <div className="pet-no-image">
                            <span>📷</span>
                            <p>프로필 사진 없음</p>
                        </div>
                    )}
                </div>

                <div className="pet-profile-info">
                    <div className="pet-info-section">
                        <h4>기본 정보</h4>
                        <div className="pet-info-grid">
                            <div className="pet-info-item">
                                <label>품종</label>
                                <span>{petProfile.type}</span>
                            </div>
                            <div className="pet-info-item">
                                <label>성별</label>
                                <span>{getGenderText(petProfile.gender)}</span>
                            </div>
                            <div className="pet-info-item">
                                <label>나이</label>
                                <span>{petProfile.age}살</span>
                            </div>
                            <div className="pet-info-item">
                                <label>몸무게</label>
                                <span>{petProfile.weight}kg</span>
                            </div>
                            <div className="pet-info-item">
                                <label>크기</label>
                                <span>{getSizeText(petProfile.size)}</span>
                            </div>
                            <div className="pet-info-item">
                                <label>입양 여부</label>
                                <span className={`adopt-badge ${petProfile.adopt ? 'adopted' : 'not-adopted'}`}>
                                    {getAdoptText(petProfile.adopt)}
                                </span>
                            </div>
                            <div className="pet-info-item">
                                <label>둥록번호</label>
                                <span>{petProfile.petId}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pet-profile-actions">
                <button
                    onClick={() => window.location.href = '/mypet/edit/${petProfile.petId}'}
                    className="edit-btn"
                >
                    수정
                </button>
                <button
                    onClick={() => handleDeletePet(petProfile.petId)}
                    className="delete-btn"
                >
                    삭제
                </button>
            </div>
        </div>
    );

    // 펫 삭제 핸들러 (필요시 구현)
    const handleDeletePet = async (petId) => {
        if (!petId) {
            console.error("❌ petId is undefined");
            return;
        }

        if (window.confirm('정말로 이 반려견 정보를 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:8080/api/pet/delete/${petId}`, {
                    withCredentials: true
                });
                fetchPetProfile(); // 삭제 후 다시 목록 불러오기
            } catch (error) {
                console.error("삭제 실패:", error);
                alert("삭제에 실패했습니다.");
            }
        }
    };


    if (isLoading) {
        return (
            <div className="mypet-profile-container">
                <div className="mypet-profile-card">
                    <div className="loading-spinner-large"></div>
                    <p>프로필을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mypet-profile-container">
                <div className="mypet-profile-card">
                    <div className="error-message-large">{error}</div>
                    <button onClick={fetchPetProfile} className="retry-btn">
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    if (!petProfiles || petProfiles.length === 0) {
        return (
            <div className="mypet-profile-container">
                <div className="mypet-profile-card">
                    <div className="no-profile">
                        <div className="paw-icon">🐾</div>
                        <h2>등록된 반려견이 없습니다</h2>
                        <p>아직 반려견 프로필을 등록하지 않으셨네요.</p>
                        <button onClick={() => window.location.href = '/mypet/register'} className="register-btn">
                            반려견 등록하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mypet-profile-container">
            <div className="profile-header">
                <div className="paw-icon">🐾</div>
                <h2>나의 반려견 프로필</h2>
                <p>총 {petProfiles.length}마리의 반려견이 등록되어 있습니다</p>
            </div>

            <div className="pets-grid">
                {petProfiles.map((petProfile, index) => (
                    <PetProfileCard
                        key={petProfile.petId}
                        petProfile={petProfile}
                        index={index}
                    />
                ))}
            </div>

            <div className="global-actions">
                <button
                    onClick={() => window.location.href = '/mypet/register'}
                    className="register-btn"
                >
                    새로운 반려견 등록
                </button>
            </div>
        </div>
    );
}

export default MyPetProfile;