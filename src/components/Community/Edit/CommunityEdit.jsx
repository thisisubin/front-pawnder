import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../Post/CommunityPost.css';

function CommunityEdit() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        postType: '',
        title: '',
        strContent: '',
        imgUrlContent: null
    });

    const [userId, setUserId] = useState('');

    // 기존 글 데이터 불러오기
    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                // 세션에서 userId 가져오기
                const sessionResponse = await axios.get('/api/users/check-session', {
                    withCredentials: true
                });
                setUserId(sessionResponse.data.userId);

                // 기존 글 데이터 가져오기
                const res = await axios.get(`/api/community/description/${postId}`, {
                    withCredentials: true
                });

                setForm({
                    postType: res.data.postType || '',
                    title: res.data.title || '',
                    strContent: res.data.strContent || '',
                    imgUrlContent: res.data.imgUrlContent || null
                });

            } catch (err) {
                console.error('게시글 로딩 실패:', err);
                alert('게시글을 불러오지 못했습니다.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId, navigate]);

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
    };

    // 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
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
            data.append('userId', userId);
            data.append('communityPost', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

            // 이미지가 파일 객체인 경우에만 append
            if (form.imgUrlContent && typeof form.imgUrlContent !== 'string') {
                data.append('imgUrlContent', form.imgUrlContent);
            }

            const response = await axios.post(`/api/community/description/${postId}/edit`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (response.data.success) {
                alert('게시글이 수정되었습니다.');
                navigate(`/community/${postId}`);
            } else {
                alert(response.data.error || '수정에 실패했습니다.');
            }

        } catch (err) {
            console.error('게시글 수정 실패:', err);
            if (err.response && err.response.data && err.response.data.error) {
                alert(err.response.data.error);
            } else {
                alert('수정 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>게시글을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="communityPost-container">
            <div className="communityPost-card">
                <div className="commu-icon">✏️</div>
                <h2>게시글 수정</h2>
                <p>게시글을 수정해주세요.</p>
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
                            {typeof form.imgUrlContent === 'string'
                                ? '기존 이미지'
                                : form.imgUrlContent.name}
                        </span>
                    )}
                    {(preview || (form.imgUrlContent && typeof form.imgUrlContent === 'string')) && (
                        <div className="image-preview">
                            <img
                                src={preview || form.imgUrlContent}
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
                                수정 중...
                            </>
                        ) : (
                            "수정하기"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CommunityEdit;
