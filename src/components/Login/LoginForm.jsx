// src/components/Login/LoginForm.jsx

import React, { useState, useEffect } from "react";
import axios from 'axios';
import Header from '../Header/Header';
import './LoginForm.css'; // css 파일이 있다면 import

function Login() {
    const [form, setForm] = useState({
        userId: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    // 사용자 정보 가져오기
    useEffect(() => {
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
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        // 에러 메시지 초기화
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.userId.trim()) {
            newErrors.userId = '아이디를 입력하세요';
        }

        if (!form.password.trim()) {
            newErrors.password = '비밀번호를 입력하세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/api/users/login', form, { withCredentials: true }).then(() => {
                window.location.href = '/';
            }); // 🔥 루트 페이지로 강제 이동 (새로고침 포함));
            // 로그인 성공 후 로직 (ex: 토큰 저장, 페이지 이동 등)
        } catch (error) {
            console.error(error);
            alert("로그인 실패: " + (error.response?.data || "오류가 발생했습니다."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header user={user} />
            <div className="login-container">
                <div className="login-card">
                    <div className="form-header">
                        <div className="paw-icon">🐾</div>
                        <h2>Pawnder 로그인하기</h2>
                        <p>유기견과 함께하는 따뜻한 pawnder 커뮤니티에 오신 것을 환영합니다</p>
                    </div>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group-row">
                            <label htmlFor="userId">아이디 *</label>
                            <input
                                id="userId"
                                name="userId"
                                type="text"
                                placeholder="4자 이상 입력해주세요"
                                value={form.userId}
                                onChange={handleChange}
                                className={errors.userId ? 'error' : ''}
                            />
                        </div>
                        {errors.userId && <span className="error-message">{errors.userId}</span>}

                        <div className="form-group-row">
                            <label htmlFor="password">비밀번호 *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="6자 이상 입력해주세요"
                                value={form.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                            />
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}

                        <button
                            type="submit"
                            className={`submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                    <div className="login-footer">
                        <p>
                            아직 회원이 아니신가요? <a href="/signup">회원가입하기</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
