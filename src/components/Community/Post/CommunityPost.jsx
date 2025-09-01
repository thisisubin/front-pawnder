import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './CommunityPost.css';

function CommunityPost({ user }) {
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        postType: '',
        title: '',
        strContent: '',
        imgUrlContent: null
    });

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'imgUrlContent' && files && files[0]) {
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

            // 이미지 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);

            setForm((prev) => ({
                ...prev,
                [name]: file,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        console.log('Form updated:', { ...form, [name]: value });
    };

    // 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 로그인 상태 확인
        if (!user || !user.loggedIn) {
            alert('게시글을 작성하려면 로그인이 필요합니다.');
            return;
        }

        setIsLoading(true);

        try {
            // 필수 필드 검증
            if (!form.postType) {
                alert('카테고리를 선택해주세요.');
                return;
            }
            if (!form.title.trim()) {
                alert('제목을 입력해주세요.');
                return;
            }

            if (!form.strContent.trim()) {
                alert('내용을 입력해주세요.');
                return;
            }

            const dto = {
                postType: form.postType,
                title: form.title,
                strContent: form.strContent,
            };

            const data = new FormData();
            data.append('communityPost', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

            if (form.imgUrlContent && typeof form.imgUrlContent !== 'string') {
                data.append('imgUrlContent', form.imgUrlContent);
            }

            const response = await axios.post('/api/community/createPost', data, {
                withCredentials: true
            });


            if (response.data.success) {
                alert('게시글이 등록되었습니다.');
                navigate('/community');
            } else {
                alert(response.data.message || '등록에 실패했습니다.');
            }

        } catch (err) {
            if (err.response && err.response.status === 401) {
                alert('로그인이 필요합니다.');
                navigate('/login');
            } else {
                console.error('게시글 등록 실패:', err);
                alert('게시글을 등록할 권한이 없습니다.'); //TODO: alert 수정하기
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="communityPost-container">
                <div className="communityPost-card">
                    <div className="commu-icon">📋</div>
                    <h2>커뮤니티 게시글</h2>
                    <p>새로운 게시글을 작성해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="communityPost">
                    <div className="form-group">
                        <label>카테고리 *</label>
                        <select name="postType" value={form.postType} onChange={handleChange} required>
                            <option value="">카테고리를 선택하세요</option>
                            <option value="TEMP_PROTECT">입양 홍보 글</option>
                            <option value="SHOW_OFF">반려견 자랑하기</option>
                            <option value="REVIEW">입양 후기</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>글 제목 *</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="글 제목을 작성하세요."
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group file-upload">
                        <label htmlFor="community-image" className="custom-file-label">
                            📷 대표 이미지 업로드
                        </label>
                        <input
                            id="community-image"
                            type="file"
                            name="imgUrlContent"
                            accept="image/*"
                            onChange={handleChange}
                            style={{ display: 'none' }}
                        />
                        {form.imgUrlContent && (
                            <span className="file-name">
                                {form.imgUrlContent.name}
                            </span>
                        )}
                        {preview && (
                            <div className="image-preview">
                                <img
                                    src={preview}
                                    alt="미리보기"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>본문 내용 *</label>
                        <textarea
                            name="strContent"
                            value={form.strContent}
                            onChange={handleChange}
                            placeholder="내용을 작성하세요..."
                            rows="15"
                            required
                            style={{
                                width: '100%',
                                whiteSpace: "pre-wrap",
                                padding: '15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                minHeight: '400px'
                            }}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                        >
                            취소
                        </button>
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    등록 중...
                                </>
                            ) : (
                                "등록하기"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default CommunityPost;
