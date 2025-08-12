import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './AbandonedPetForm.css';
import KakaoMap from "../../pages/KakaoMap";

function AbandonedPetForm({ user }) {
    const navigate = useNavigate();
    const [predictedBreed, setPredictedBreed] = useState('');
    const [isPredicting, setIsPredicting] = useState(false);

    const [form, setForm] = useState({
        latitude: '',
        longitude: '',
        imageurl: null,
        preview: null,
        gender: '',
        description: '',
        location: '',
        type: '',
        foundDate: '',
        foundTime: '',
    });

    // 지도 클릭 시 위도/경도 저장
    const handleMapClick = ({ latitude, longitude }) => {
        setForm((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        }));
    };


    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "imageurl" && files && files[0]) {
            const file = files[0];

            // FileReader를 이용해 이미지 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({
                    ...prev,
                    imageurl: file,
                    preview: reader.result, // base64 문자열 또는 Blob URL
                }));

                // 이미지가 업로드되면 품종 예측 실행
                predictBreed(file);
            };
            reader.readAsDataURL(file); // 이미지 파일을 dataURL로 읽음
        } else {
            setForm({
                ...form,
                [name]: value,
            });
        }
    }

    // 품종 예측 함수
    const predictBreed = async (imageFile) => {
        if (!imageFile) return;

        setIsPredicting(true);
        setPredictedBreed('');

        try {
            const formData = new FormData();
            formData.append('imageurl', imageFile);

            const response = await axios.post('/api/abandoned/predict', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            const { predictedBreed } = response.data;
            setPredictedBreed(predictedBreed);

            // 예측된 품종을 form의 type 필드에 자동 설정
            setForm(prev => ({
                ...prev,
                type: predictedBreed
            }));

        } catch (error) {
            console.error('품종 예측 실패:', error);
            alert('품종 예측에 실패했습니다. 수동으로 입력해주세요.');
        } finally {
            setIsPredicting(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        //필수 필드 검사
        if (!form.latitude.trim()) {
            newErrors.latitude = '위도를 다시 선택해주세요';
        }

        if (!form.longitude.trim()) {
            newErrors.longitude = '경도를 다시 선택해주세요';
        }

        if (!form.imageurl) {
            newErrors.imageurl = '유기견 사진은 필수입니다';
        }

        if (!form.description) {
            newErrors.description = '유기견에 대한 설명은 필수입니다';
        }

        if (!form.location) {
            newErrors.location = '발견된 지역을 선택해주세요';
        }

        if (!form.foundDate) {
            newErrors.foundDate = '발견된 날짜를 선택해주세요';
        }

        if (!form.foundTime) {
            newErrors.foundTime = '발견된 시각을 선택해주세요';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("handleSubmit called");

        // 로그인 상태 확인
        if (!user || !user.loggedIn) {
            alert('유기견을 제보하려면 로그인이 필요합니다.');
            return;
        }

        if (!validateForm()) {
            console.log("유효성 검사 실패", errors);
            return;
        }

        setIsLoading(true);
        console.log("유효성 통과, 서버에 전송 시작");

        try {
            const formData = new FormData();

            const AbandonedPetDto = {
                latitude: form.latitude,
                longitude: form.longitude,
                gender: form.gender,
                description: form.description,
                location: form.location,
                type: form.type,
                foundDate: form.foundDate,
                foundTime: form.foundTime,
            };
            formData.append("abandoned-pet", new Blob([JSON.stringify(AbandonedPetDto)], { type: "application/json" }));
            formData.append("imageurl", form.imageurl);

            const response = await axios.post('/api/abandoned/register', formData, {
                withCredentials: true
            });

            alert('유기견 제보가 완료되었습니다.\n제보해주셔서 감사합니다.');

            setForm({
                latitude: '',
                longitude: '',
                imageurl: null,
                gender: '',
                description: '',
                location: '',
                type: '',
                foundDate: '',
                foundTime: '',
            });
        } catch (error) {
            console.error("제보 실페:", error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data ||
                "오류가 발생했습니다.";
            alert("유기견 등록 실패: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="abandonedpet-container">
            <div className="abandonedpet-content">
                <div className="abandonedpet-card">
                    <div className="paw-icon">🚨</div>
                    <h2>유기견 제보</h2>
                    <p>유기견을 제보해주세요</p>
                </div>

                <form onSubmit={handleSubmit} className="abandonedpet-form">
                    <div className="form-group">
                        <label>📍 발견된 위치를 지도에서 클릭해주세요</label>
                        <KakaoMap onSelectLocation={handleMapClick}
                            latitude={form.latitude}
                            longitude={form.longitude} />
                        {errors.latitude && <span className="error">{errors.latitude}</span>}
                        {errors.longitude && <span className="error">{errors.longitude}</span>}
                    </div>


                    <div className="form-group file-upload">
                        <label htmlFor="abandoned-image" className="custom-file-label">📷 사진 업로드</label>
                        <input
                            id="abandoned-image"
                            type="file"
                            name="imageurl"
                            accept="image/*"
                            onChange={handleChange}
                        />
                        {form.imageurl && <span className="file-name">{form.imageurl.name}</span>}
                        {form.preview && (
                            <img
                                src={form.preview}
                                alt="미리보기"
                                style={{ width: "200px", height: "auto", marginTop: "10px", borderRadius: "8px" }}
                            />
                        )}
                        {errors.imageurl && <span className="error">{errors.imageurl}</span>}
                    </div>
                    <br></br>

                    <div className="form-group">
                        <label>성별</label>
                        <select
                            id="gender"
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                        >
                            <option value="">선택</option>
                            <option value="FEMALE">암컷</option>
                            <option value="MALE">
                                수컷
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>AI 품종 판별하기</label>
                        {isPredicting ? (
                            <div className="predicting-status">
                                <p>🔍 AI가 품종을 분석하고 있습니다...</p>
                            </div>
                        ) : predictedBreed ? (
                            <div className="prediction-result">
                                <p>✅ 예측된 품종: <strong>{predictedBreed}</strong></p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPredictedBreed('');
                                        setForm(prev => ({ ...prev, type: '' }));
                                    }}
                                    className="reset-prediction"
                                >
                                    다시 예측하기
                                </button>
                            </div>
                        ) : (
                            <div className="prediction-placeholder">
                                <p>📷 사진을 업로드하면 AI가 품종을 자동으로 판별합니다</p>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>품종 (수동 입력)</label>
                        <input
                            type="text"
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            placeholder="AI 예측 결과가 자동으로 입력되거나 수동으로 입력하세요"
                        />
                    </div>

                    <div className="form-group">
                        <label>설명</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                        />
                        {errors.description && <span className="error">{errors.description}</span>}
                    </div>

                    <div className="form-group">
                        <label>발견된 지역</label>
                        <select
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                        >
                            <option value="">선택</option>
                            <option value="서울특별시">서울특별시</option>
                            <option value="인천광역시">인천광역시</option>
                            <option value="경기도">경기도</option>
                            <option value="강원도">강원도</option>
                            <option value="전라북도">전라북도</option>
                            <option value="전라남도">전라남도</option>
                            <option value="충청북도">충청북도</option>
                            <option value="충청남도">충청남도</option>
                            <option value="경상북도">경상북도</option>
                            <option value="경상남도">경상남도</option>
                            <option value="부산광역시">부산광역시</option>
                        </select>
                        {errors.location && <span className="error">{errors.location}</span>}
                    </div>

                    <div className="form-group">
                        <label>발견 날짜</label>
                        <input
                            type="date"
                            name="foundDate"
                            value={form.foundDate}
                            onChange={handleChange}
                        />
                        {errors.foundDate && <span className="error">{errors.foundDate}</span>}
                    </div>

                    <div className="form-group">
                        <label>발견 시각</label>
                        <input
                            type="time"
                            name="foundTime"
                            value={form.foundTime}
                            onChange={handleChange}
                        />
                        {errors.foundTime && <span className="error">{errors.foundTime}</span>}
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? '제보 중...' : '제보하기'}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default AbandonedPetForm;