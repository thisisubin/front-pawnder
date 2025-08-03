import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MyPetForm from '../components/MyPet/MyPetForm';
import Header from '../components/Header/Header';

function MyPetPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get('/api/users/check-session', { withCredentials: true });
                setUser(userResponse.data);
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
                if (error.response?.status === 401) {
                    alert('로그인이 필요합니다.');
                    navigate('/login');
                }
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        setUser(null);
        navigate('/login');
    };

    return (
        <div>
            <Header user={user} onLogout={handleLogout} />
            <MyPetForm />
        </div>
    );
}

export default MyPetPage;