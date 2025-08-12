import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './CommunityGet.css';

function CommunityDetail() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // 로그인한 사용자 정보 가져오기 (일반 로그인 + 소셜로그인)
        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get('/api/users/check-session', { withCredentials: true });
                console.log('사용자 정보:', userResponse.data);
                setUser(userResponse.data);
            } catch (error) {
                console.error('사용자 정보 로딩 실패:', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/api/community/description/${postId}`, { withCredentials: true });
                setPost(res.data);
            } catch (err) {
                alert('해당 게시글을 불러올 수 없습니다.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId, navigate]);

    // 좋아요 상태와 댓글 가져오기
    useEffect(() => {
        if (postId) {
            fetchLikeStatus();
            fetchComments();
        }
    }, [postId]);

    // 좋아요 상태 가져오기
    const fetchLikeStatus = async () => {
        try {
            const response = await axios.get(`/api/community/like/${postId}/count`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            setIsLiked(response.data.isLiked || false);
            setLikeCount(response.data.likeCount || 0);
        } catch (error) {
            console.error('좋아요 상태 조회 실패:', error);
        }
    };

    // 댓글 목록 가져오기
    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/community/comments/${postId}`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            setComments(response.data || []);
        } catch (error) {
            console.error('댓글 목록 조회 실패:', error);
        }
    };

    // 좋아요 토글
    const handleLikeToggle = async () => {
        // 로그인 상태 확인
        if (!user || !user.loggedIn) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            return;
        }

        try {
            const response = await axios.post(`/api/community/like/${postId}/toggle`, null, {
                withCredentials: true
            });
            setIsLiked(response.data.isLiked);
            setLikeCount(response.data.likeCount);
        } catch (error) {
            console.error('좋아요 토글 실패:', error);
            console.error('에러 응답:', error.response?.data);

            if (error.response?.status === 401) {
                alert('로그인이 필요합니다. 다시 로그인해주세요.');
            } else if (error.response?.status === 400) {
                alert('좋아요 처리 중 오류가 발생했습니다: ' + (error.response?.data?.error || error.message));
            } else {
                alert('좋아요 처리 중 오류가 발생했습니다.');
            }
        }
    };

    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        setIsSubmittingComment(true);
        try {
            const response = await axios.post(`/api/community/comment/${postId}`, {
                content: newComment
            }, {
                withCredentials: true
            });
            setNewComment('');
            setShowCommentInput(false); // 댓글 작성 후 입력창 닫기
            await fetchComments(); // 댓글 목록 새로고침
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            alert('로그인된 유저만 댓글을 작성하실 수 있습니다.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleEdit = () => {
        navigate(`/community/${postId}/edit`);
    };

    const handleDelete = async () => {
        if (window.confirm('정말로 이 글을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/api/community/description/${postId}/delete`, { withCredentials: true });
                alert('글이 삭제되었습니다.');
                navigate('/community');
            } catch (err) {
                alert('글 삭제에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return <div className="community-get-loading">불러오는 중...</div>;
    }

    if (!post) {
        return <div className="community-get-empty">게시글을 찾을 수 없습니다.</div>;
    }

    // 로그인한 사용자와 글 작성자가 같은지 확인 (일반 로그인 + 소셜로그인)
    const isAuthor = user && post.userId && user.loggedIn && (
        user.userId === post.userId ||
        user.username === post.userId ||
        user.email === post.userId
    );

    return (
        <div className="community-detail-container">
            <button className="community-detail-back" onClick={() => navigate('/community')}>← 목록으로</button>
            <div className="community-detail-card">
                <div className="community-detail-thumb">
                    {post.imgUrlContent ? (
                        <img src={post.imgUrlContent} alt="썸네일" />
                    ) : (
                        <div className="community-get-noimg">이미지 없음</div>
                    )}
                </div>
                <div className="community-detail-info">
                    <div className="community-detail-header">
                        <div className="community-detail-meta">
                            <div className="community-get-category">{post.postType}</div>
                            <h2 className="community-detail-title">{post.title}</h2>
                            <div className="community-detail-date">{post.createdAt?.slice(0, 10)}</div>
                        </div>
                        <div className="community-detail-author">
                            작성자: {post.userId}
                        </div>

                        {isAuthor && (
                            <div className="community-detail-actions">
                                <button className="edit-btn" onClick={handleEdit}>수정</button>
                                <button className="delete-btn" onClick={handleDelete}>삭제</button>
                            </div>
                        )}
                    </div>
                    <div className="community-detail-content" dangerouslySetInnerHTML={{ __html: post.strContent }} />

                    {/* 좋아요 섹션 */}
                    <div className="like-section">
                        <div className="action-buttons">
                            <button
                                type="button"
                                className={`like-btn ${isLiked ? 'liked' : ''}`}
                                onClick={handleLikeToggle}
                                title={isLiked ? '좋아요 취소' : '좋아요'}
                            >
                                <span className="like-icon">
                                    {isLiked ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#ed4956">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    )}
                                </span>
                            </button>
                            {likeCount > 0 && (
                                <div className="like-count-text">
                                    좋아요 <strong>{likeCount}</strong>개
                                </div>
                            )}

                            <button
                                type="button"
                                className="comment-btn"
                                onClick={() => {
                                    if (!user || !user.loggedIn) {
                                        alert('댓글을 작성하려면 로그인이 필요합니다.');
                                        return;
                                    }
                                    setShowCommentInput(!showCommentInput);
                                }}
                            >
                                <span className="comment-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </span>
                                <span className="comment-text"></span>
                            </button>
                        </div>
                    </div>

                    {/* 댓글 입력 섹션 (토글) */}
                    {showCommentInput && (
                        <div className="comment-input-section">
                            <form onSubmit={handleCommentSubmit} className="comment-form">
                                <div className="comment-input-group">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="댓글을 작성해주세요..."
                                        className="comment-input"
                                        rows="2"
                                        maxLength="500"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="comment-submit-btn"
                                        disabled={isSubmittingComment || !newComment.trim()}
                                    >
                                        {isSubmittingComment ? '작성 중...' : '게시'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* 댓글 목록 섹션 */}
                    <div className="comments-section">
                        <h3>{comments.length > 0 ? `댓글 ${comments.length}개` : '댓글'}</h3>
                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                            ) : (
                                comments.map((comment, index) => (
                                    <div key={comment.id || index} className="comment-item">
                                        <div className="comment-header">
                                            <span className="comment-author">{comment.userId || '익명'}</span>
                                            <span className="comment-date">
                                                {new Date(comment.createdAt || comment.created_at).toLocaleDateString('ko-KR')}
                                            </span>
                                        </div>
                                        <div className="comment-content">
                                            {comment.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommunityDetail;
