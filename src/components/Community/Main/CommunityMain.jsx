import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './CommunityMain.css';

function CommunityMain({ user }) {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // 전체 커뮤니티 글 목록 불러오기
        const fetchPosts = async () => {
            try {
                const res = await axios.get('/api/community/posts', { withCredentials: true });
                setPosts(res.data);
            } catch (err) {
                alert('글을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [user]);

    if (loading) {
        return (
            <div className="community-loading">
                <div className="community-loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="community-container">
            <main className="community-content">
                <section className="community-welcome-section">
                    <h2>반려견과 함께하는 따뜻한 커뮤니티</h2>
                    <p>Pawnder에서 소중한 인연을 만들어보세요</p>
                </section>

                <section className="community-features-section">
                    <div className="community-features-grid">
                        {user?.username === 'admin' ? (
                            <div className="community-feature-card" onClick={() => navigate('/admin/abandoned-pets')}>
                                <div className="community-feature-icon">📋</div>
                                <h4>유기견 제보 리스트</h4>
                                <p>등록된 유기견 제보를 확인하세요.</p>
                            </div>
                        ) : (
                            <div className="community-feature-card" onClick={() => navigate('/abandoned/register')}>
                                <div className="community-feature-icon">🚨</div>
                                <h4>유기견 제보</h4>
                                <p>유기견을 발견하셨다면, 신고해주세요!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 표(리스트)와 글작성 버튼을 유기견 카드 바로 아래, 동일한 폭으로 */}
                <section className="community-table-section">
                    <div className="community-table-header">
                        <div style={{ flex: 1 }}></div>
                        <button className="community-write-post-btn small" onClick={() => navigate('/community/createPost')}>
                            글 작성하기
                        </button>
                    </div>
                    <div className="community-post-list-table-wrap">
                        <table className="community-post-list-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>이미지</th>
                                    <th style={{ width: '100px' }}>분류</th>
                                    <th style={{ width: '250px' }}>제목</th>
                                    <th style={{ width: '100px' }}>작성자</th>
                                    <th style={{ width: '120px' }}>작성일</th>
                                    <th style={{ width: '150px' }}>내용 미리보기</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center' }}>게시글이 없습니다.</td></tr>
                                ) : (
                                    posts.map(post => (
                                        <tr
                                            className="community-post-list-row"
                                            key={post.id}
                                            onClick={() => navigate(`/community/${post.id}`)}
                                        >
                                            <td>
                                                {post.imgUrlContent ? (
                                                    <img src={post.imgUrlContent} alt="썸네일" className="community-post-list-thumb" />
                                                ) : (
                                                    <div className="community-post-list-noimg">-</div>
                                                )}
                                            </td>
                                            <td><span className="community-post-list-category">{post.postType}</span></td>
                                            <td className="community-post-list-title">{post.title}</td>
                                            <td className="community-post-list-author">{post.userId || '익명'}</td>
                                            <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                            <td className="community-post-list-preview">
                                                {post.strContent ?
                                                    post.strContent.replace(/<[^>]+>/g, '').slice(0, 50) + '...' :
                                                    (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 50) + '...' : '내용 없음')
                                                }
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default CommunityMain;
