import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MyPetProfile.css';
import axios from 'axios';

function MyPetEditPage() {
    const { petId } = useParams();
    const navigate = useNavigate();

    const [petData, setPetData] = useState({
        name: '',
        type: '',
        profile: '',
        weight: '',
        age: '',
        size: '',
        gender: '',
        adopt: false,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/pet/${petId}`, { withCredentials: true })
            .then((res) => {
                setPetData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("반려견 정보 불러오기 실패", err);
                setLoading(false);
            });
    }, [petId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPetData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/pet/edit/${petId}`, petData, {
                withCredentials: true
            });
            alert('수정 성공!');
            navigate('/mypet');
        } catch (err) {
            console.error('수정 실패', err);
            alert('수정 중 오류 발생');
        }
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

    if (loading) return <p>로딩 중...</p>;

    return (
        <div className="edit-page">
            <h2>반려견 정보 수정</h2>
            <form onSubmit={handleSubmit}>
                <div className="pet-profile-info">
                    <div className="pet-info-section">
                        <h4>기본 정보</h4>
                        <div className="pet-info-grid">
                            <div className="pet-info-item">
                                <label>이름</label>
                                <input type="text" name="name" value={petData.name} onChange={handleChange} />
                            </div>
                            <div className="pet-info-item">
                                <label>품종</label>
                                <input type="text" name="type" value={petData.type} onChange={handleChange} />
                            </div>
                            <div className="pet-info-item">
                                <label>나이</label>
                                <input type="number" name="age" value={petData.age} onChange={handleChange} />
                            </div>
                            <div className="pet-info-item">
                                <label>몸무게</label>
                                <input type="number" name="weight" value={petData.weight} onChange={handleChange} />
                            </div>
                            <div className="pet-info-item">
                                <label>크기</label>
                                <select name="size" value={petData.size} onChange={handleChange}>
                                    <option value="SMALL">소형견</option>
                                    <option value="MEDIUM">중형견</option>
                                    <option value="LARGE">대형견</option>
                                </select>
                            </div>
                            <div className="pet-info-item">
                                <label>성별</label>
                                <select name="gender" value={petData.gender} onChange={handleChange}>
                                    <option value="MALE">수컷</option>
                                    <option value="FEMALE">암컷</option>
                                    <option value="NEUTER">중성</option>
                                </select>
                            </div>
                            <div className="pet-info-item">
                                <label>입양 여부</label>
                                <input type="checkbox" name="adopt" checked={petData.adopt} onChange={handleChange} />
                            </div>
                            <div className="pet-info-item">
                                <label>등록번호</label>
                                <span>{petId}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit">저장</button>
            </form>
        </div>
    );
}

export default MyPetEditPage;
