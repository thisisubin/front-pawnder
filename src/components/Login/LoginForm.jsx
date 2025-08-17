// src/components/Login/LoginForm.jsx

import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import './LoginForm.css'; // css 파일이 있다면 import

function LoginForm({ user, onLoginSuccess }) {
    const [form, setForm] = useState({
        userId: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
            const response = await api.post('/api/users/login', form, {

                withCredentials: true
            });

            if (response.status === 200) {
                alert('로그인에 성공했습니다!');

                // 부모 컴포넌트의 사용자 상태 업데이트
                if (onLoginSuccess) {
                    await onLoginSuccess();
                }

                // 메인 페이지로 이동
                window.location.href = '/';
            }
        } catch (error) {
            console.error(error);
            alert("로그인 실패: " + (error.response?.data || "오류가 발생했습니다."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            // Spring Security OAuth2 소셜 로그인 URL로 리다이렉트
            const socialLoginUrls = {
                kakao: 'https://www.pawnder.site/oauth2/authorization/kakao',
                google: 'https://www.pawnder.site/oauth2/authorization/google',
                naver: 'https://www.pawnder.site/oauth2/authorization/naver',
            };

            const loginUrl = socialLoginUrls[provider];
            if (loginUrl) {
                // 소셜 로그인 URL로 리다이렉트
                window.location.href = loginUrl;
            } else {
                alert('지원하지 않는 소셜 로그인입니다.');
            }
        } catch (error) {
            console.error('소셜 로그인 오류:', error);
            alert('소셜 로그인 중 오류가 발생했습니다.');
        }
    };

    // 소셜 로그인 오류 처리
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');

        if (error) {
            alert('소셜 로그인에 실패했습니다: ' + error);
            // URL 파라미터 제거
            window.history.replaceState({}, document.title, '/login');
        }
    }, []);

    return (
        <>
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

                    {/* 소셜 로그인 구분선 */}
                    <div className="social-login-divider">
                        <span>또는</span>
                    </div>

                    {/* 소셜 로그인 버튼들 */}
                    <div className="social-login-buttons">
                        <button
                            type="button"
                            className="social-login-btn kakao-btn"
                            onClick={() => handleSocialLogin('kakao')}
                        >
                            <svg className="social-logo" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                            </svg>
                            카카오로 로그인
                        </button>

                        <button
                            type="button"
                            className="social-login-btn google-btn"
                            onClick={() => handleSocialLogin('google')}
                        >
                            <svg className="social-logo" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            구글로 로그인
                        </button>

                        <button
                            type="button"
                            className="social-login-btn naver-btn"
                            onClick={() => handleSocialLogin('naver')}
                        >
                            <svg className="social-logo" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                            </svg>
                            네이버로 로그인
                        </button>
                    </div>

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

export default LoginForm;
