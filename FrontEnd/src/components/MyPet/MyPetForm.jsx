import React, { useState } from "react";
import axios from "axios";
import './MyPetForm.css';

function MyPetForm() {
    const [form, setForm] = useState({
        name: '',
        profile: null,
        preview: null, // 이미지 미리보기 URL 추가
        adopt: '',
        type: '',
        weight: '',
        size: '',
        age: '',
        gender: '',
        petId: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        // 숫자 필드 유효성 검사
        if (name === 'weight' || name === 'age') {
            if (value && isNaN(value)) {
                return; // 숫자가 아니면 입력 무시
            }
        }

        if (type === "file" && files && files[0]) {
            const file = files[0];

            // 파일 크기 체크 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }

            // 파일 타입 체크
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }

            // FileReader를 이용해 이미지 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({
                    ...prev,
                    profile: file,
                    preview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setForm({
                ...form,
                [name]: value,
            });
        }

        // 에러 메시지 초기화
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // 필수 필드 검사
        if (!form.name.trim()) {
            newErrors.name = '반려견의 이름을 입력해주세요';
        }

        if (!form.profile) {
            newErrors.profile = '프로필 사진을 선택해주세요';
        }

        if (!form.adopt) {
            newErrors.adopt = '입양 여부를 선택해주세요';
        }

        if (!form.type.trim()) {
            newErrors.type = '반려견 품종을 입력해주세요';
        }

        if (!form.weight.trim()) {
            newErrors.weight = '반려견 몸무게를 입력해주세요';
        } else if (isNaN(form.weight) || parseFloat(form.weight) <= 0) {
            newErrors.weight = '올바른 몸무게를 입력해주세요';
        }

        if (!form.size) {
            newErrors.size = '반려견 사이즈를 선택해주세요';
        }

        if (!form.age.trim()) {
            newErrors.age = '반려견 나이를 입력해주세요';
        } else if (isNaN(form.age) || parseInt(form.age) <= 0) {
            newErrors.age = '올바른 나이를 입력해주세요';
        }

        if (!form.gender) {
            newErrors.gender = '반려견 성별을 선택해주세요';
        }

        if (!form.petId.trim()) {
            newErrors.petId = '반려견 등록번호를 입력해주세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("handleSubmit called");

        if (!validateForm()) {
            console.log("유효성 검사 실패", errors);
            return;
        }

        setIsLoading(true);
        console.log("유효성 통과, 서버에 전송 시작");

        try {
            const formData = new FormData();

            // 데이터 타입 변환하여 JSON 생성
            const petDto = {
                name: form.name,
                adopt: form.adopt === 'true', // boolean으로 변환
                type: form.type,
                weight: parseFloat(form.weight), // number로 변환
                size: form.size.toUpperCase(),
                age: parseInt(form.age), // number로 변환
                gender: form.gender.toUpperCase(),
                petId: form.petId,
            };

            formData.append("pet", new Blob([JSON.stringify(petDto)], { type: "application/json" }));
            formData.append("profile", form.profile);

            const response = await axios.post('/api/pet/register', formData, {

                withCredentials: true
            });

            alert('반려견 등록이 완료되었습니다! 🐕');

            // 성공 후 폼 초기화
            setForm({
                name: '',
                profile: null,
                preview: null,
                adopt: '',
                type: '',
                weight: '',
                size: '',
                age: '',
                gender: '',
                petId: '',
            });

        } catch (error) {
            console.error("등록 실패:", error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data ||
                "오류가 발생했습니다.";
            alert("반려견 등록 실패: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mypet-container">
            <div className="mypet-card">
                <div className="form-header">
                    <div className="paw-icon">🐾</div>
                    <h2>나의 반려견 프로필</h2>
                    <p>소중한 반려견의 정보를 등록해주세요</p>
                </div>

                <form onSubmit={handleSubmit} className="mypet-form">
                    <div className="form-group">
                        <label htmlFor="name">이름 *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="강아지 이름"
                            value={form.name}
                            onChange={handleChange}
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group file-upload">
                        <label htmlFor="profile" className="custom-file-label">
                            📷 프로필 사진 업로드
                        </label>
                        <input
                            id="profile"
                            name="profile"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            style={{ display: 'none' }}
                            className={errors.profile ? 'error' : ''}
                        />
                        {form.profile && <span className="file-name">{form.profile.name}</span>}
                        {form.preview && (
                            <div className="image-preview">
                                <img
                                    src={form.preview}
                                    alt="미리보기"
                                />
                            </div>
                        )}
                        {errors.profile && <span className="error-message">{errors.profile}</span>}
                    </div>



                    <div className="form-group">
                        <label>입양 여부 *</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="adopt"
                                    value="true"
                                    checked={form.adopt === 'true'}
                                    onChange={handleChange}
                                />
                                <span> 예</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="adopt"
                                    value="false"
                                    checked={form.adopt === 'false'}
                                    onChange={handleChange}
                                />
                                <span> 아니오</span>
                            </label>
                        </div>
                        {errors.adopt && <span className="error-message">{errors.adopt}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">반려견 품종 *</label>
                        <input
                            id="type"
                            name="type"
                            type="text"
                            placeholder="푸들"
                            value={form.type}
                            onChange={handleChange}
                            className={errors.type ? 'error' : ''}
                        />
                        {errors.type && <span className="error-message">{errors.type}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="weight">반려견 몸무게 *</label>
                        <div className="input-with-unit">
                            <input
                                id="weight"
                                name="weight"
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="5.0"
                                value={form.weight}
                                onChange={handleChange}
                                className={errors.weight ? 'error' : ''}
                            />
                            <span>kg</span>
                        </div>
                        {errors.weight && <span className="error-message">{errors.weight}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="size">반려견 사이즈 *</label>
                        <select
                            id="size"
                            name="size"
                            value={form.size}
                            onChange={handleChange}
                            className={errors.size ? 'error' : ''}
                        >
                            <option value="">선택</option>
                            <option value="LARGE">대형견</option>
                            <option value="MEDIUM">중형견</option>
                            <option value="SMALL">소형견</option>
                        </select>
                        {errors.size && <span className="error-message">{errors.size}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="age">반려견 나이 *</label>
                        <div className="input-with-unit">
                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="0"
                                placeholder="5"
                                value={form.age}
                                onChange={handleChange}
                                className={errors.age ? 'error' : ''}
                            />
                            <span>살</span>
                        </div>
                        {errors.age && <span className="error-message">{errors.age}</span>}
                    </div>

                    <div className="form-group">
                        <label>반려견 성별 *</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={form.gender === 'FEMALE'}
                                    onChange={handleChange}
                                />
                                <span> 암컷</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={form.gender === 'MALE'}
                                    onChange={handleChange}
                                />
                                <span> 수컷</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="NEUTER"
                                    checked={form.gender === 'NEUTER'}
                                    onChange={handleChange}
                                />
                                <span> 중성</span>
                            </label>
                        </div>
                        {errors.gender && <span className="error-message">{errors.gender}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="petId">반려견 등록번호 *</label>
                        <input
                            id="petId"
                            name="petId"
                            type="text"
                            placeholder="410000-2023-00001"
                            value={form.petId}
                            onChange={handleChange}
                            className={errors.petId ? 'error' : ''}
                        />
                        {errors.petId && <span className="error-message">{errors.petId}</span>}
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                등록 중...
                            </>
                        ) : (
                            '등록 완료 🐶'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MyPetForm;