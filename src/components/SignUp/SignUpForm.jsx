import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUpForm.css';

function SignUpForm({ user }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        userId: '',
        email: '',
        password: '',
        confirmPassword: '',
        birth: '',
        phoneNm: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = '이름을 입력해주세요';
        }

        if (!form.userId.trim()) {
            newErrors.userId = '아이디를 입력해주세요';
        } else if (form.userId.length < 4) {
            newErrors.userId = '아이디는 4자 이상이어야 합니다';
        }

        if (!form.email.trim()) {
            newErrors.email = '이메일을 입력해주세요';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = '올바른 이메일 형식을 입력해주세요';
        }

        if (!form.password) {
            newErrors.password = '비밀번호를 입력해주세요';
        } else if (form.password.length < 6) {
            newErrors.password = '비밀번호는 6자 이상이어야 합니다';
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }

        if (!form.birth.trim()) {
            newErrors.birth = '생년월일을 입력해주세요';
        }

        if (!form.phoneNm.trim()) {
            newErrors.phoneNm = '전화번호를 입력해주세요';
        }

        if (!emailVerified) {
            newErrors.email = '이메일 인증을 완료해주세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendVerificationCode = async () => {
        if (!form.email.trim()) {
            setErrors({ ...errors, email: '이메일을 먼저 입력해주세요' });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(form.email)) {
            setErrors({ ...errors, email: '올바른 이메일 형식을 입력해주세요' });
            return;
        }

        setIsSendingCode(true);

        try {
            const response = await axios.post('/api/users/send-email', null, {
                params: { email: form.email },
            });

            console.log('인증번호가 이메일로 발송되었습니다! 📧');
            setCodeSent(true);
            setEmailVerified(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            console.log('타이머 시작: 120초');
            setTimer(120);

            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        return 0;
                    }
                    console.log('타이머 업데이트:', newTime);
                    return newTime;
                });
            }, 1000);

        } catch (error) {
            console.error('이메일 발송 실패:', error);
            console.error('에러 상세:', error.response?.data);
            console.error('에러 상태:', error.response?.status);

            console.log('에러로 인해 타이머 시작 안함');

            const errorMessage = error.response?.data?.message || error.response?.data || error.message || '알 수 없는 오류가 발생했습니다';
            console.log('인증번호 발송에 실패했습니다: ' + errorMessage);
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setErrors({ ...errors, verificationCode: '인증번호를 입력해주세요' });
            return;
        }

        setIsVerifyingCode(true);

        try {
            const response = await axios.post('/api/users/verify-email', null, {
                params: { code: verificationCode }
            });
            console.log('이메일 인증이 완료되었습니다! ✅');
            setEmailVerified(true);
            setVerificationCode('');
        } catch (error) {
            console.error(error);
            console.log('인증번호가 올바르지 않습니다: ' + (error.response?.data || '오류가 발생했습니다'));
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("🟡 handleSubmit called");
        if (!validateForm()) {
            console.log("유효성 검사 실패", errors);
            return;
        }

        setIsLoading(true);
        console.log("유효성 통과, 서버에 전송 시작");

        try {
            const { confirmPassword, ...sendForm } = form;

            const response = await axios.post('/api/users/signup', sendForm);
            console.log('회원가입이 완료되었습니다! 🐕');

            setForm({
                name: '',
                userId: '',
                email: '',
                password: '',
                confirmPassword: '',
                birth: '',
                phoneNm: '',
            });

            navigate('/login');
        } catch (error) {
            console.error(error);
            console.log("회원가입 실패: " + (error.response?.data || "오류가 발생했습니다"));
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // 이메일 인증이 완료되면 타이머 정리
    useEffect(() => {
        if (emailVerified) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [emailVerified]);

    return (
        <>
            <div className="signup-container">
                <div className="signup-card">
                    <div className="form-header">
                        <div className="paw-icon">🐾</div>
                        <h2>Pawnder 가입하기</h2>
                        <p>유기견과 함께하는 따뜻한 pawnder 커뮤니티에 오신 것을 환영합니다</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-group">
                            <label htmlFor="name">이름 *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="홍길동"
                                value={form.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group">
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
                            {errors.userId && <span className="error-message">{errors.userId}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">이메일 *</label>
                            <div className="email-input-group">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    disabled={emailVerified}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendVerificationCode}
                                    className={`send-code-btn ${emailVerified ? 'verified' : ''} ${isSendingCode ? 'sending' : ''}`}
                                    disabled={emailVerified || isSendingCode}
                                >
                                    {emailVerified ? (
                                        '✓ 인증완료'
                                    ) : isSendingCode ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            발송중...
                                        </>
                                    ) : (
                                        '인증번호 보내기'
                                    )}
                                </button>
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                            {emailVerified && <span className="success-message">✓ 이메일 인증이 완료되었습니다</span>}
                        </div>

                        {codeSent && !emailVerified && (
                            <div className="form-group">
                                <label htmlFor="verificationCode">인증번호 *</label>
                                <div className="verification-input-group">
                                    <input
                                        id="verificationCode"
                                        name="verificationCode"
                                        type="text"
                                        placeholder="이메일로 받은 6자리 인증번호를 입력하세요"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className={errors.verificationCode ? 'error' : ''}
                                        maxLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyCode}
                                        className={`verify-code-btn ${isVerifyingCode ? 'verifying' : ''}`}
                                        disabled={isVerifyingCode || !verificationCode.trim() || timer === 0}
                                    >
                                        {isVerifyingCode ? (
                                            <>
                                                <span className="loading-spinner"></span>
                                                인증중...
                                            </>
                                        ) : (
                                            '인증하기'
                                        )}
                                    </button>
                                </div>
                                <div className="timer-container">
                                    {timer > 0 ? (
                                        <span className="timer-text">⏰ 남은시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                                    ) : (
                                        <span className="timer-text expired">⏰ 인증 시간이 만료되었습니다</span>
                                    )}
                                </div>
                                {errors.verificationCode && <span className="error-message">{errors.verificationCode}</span>}
                            </div>
                        )}

                        <div className="form-group">
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
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="비밀번호를 다시 입력해주세요"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="birth">생년월일 *</label>
                            <input
                                id="birth"
                                name="birth"
                                type="date"
                                value={form.birth}
                                onChange={handleChange}
                                className={errors.birth ? 'error' : ''}
                            />
                            {errors.birth && <span className="error-message">{errors.birth}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNm">전화번호 *</label>
                            <input
                                id="phoneNm"
                                name="phoneNm"
                                type="tel"
                                placeholder="010-1234-5678"
                                value={form.phoneNm}
                                onChange={handleChange}
                                className={errors.phoneNm ? 'error' : ''}
                            />
                            {errors.phoneNm && <span className="error-message">{errors.phoneNm}</span>}
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    가입 중...
                                </>
                            ) : (
                                '회원가입 완료 🐕'
                            )}
                        </button>
                    </form>

                    <div className="signup-footer">
                        <p>이미 계정이 있으신가요? <a href="/login">로그인하기</a></p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignUpForm;