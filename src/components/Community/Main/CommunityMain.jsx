import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import './CommunityMain.css';

function CommunityMain() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // 사용자 정보 가져오기
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
    }, []);

    const handleLogout = () => {
        setUser(null);
    };

    if (loading) {
        return (
            <div className="main-loading">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="main-container">
            <Header user={user} onLogout={handleLogout} />

            <main className="main-content">
                <section className="welcome-section">
                    <h2>반려견과 함께하는 따뜻한 커뮤니티</h2>
                    <p>Pawnder에서 소중한 인연을 만들어보세요</p>
                </section>

                <section className="features-section">
                    <div className="features-grid">
                        {user?.username === 'admin' ? (
                            <div className="feature-card" onClick={() => navigate('/admin/abandoned-pets')}>
                                <div className="feature-icon">📋</div>
                                <h4>유기견 제보 리스트</h4>
                                <p>등록된 유기견 제보를 확인하세요.</p>
                            </div>
                        ) : (
                            <div className="feature-card" onClick={() => navigate('/abandoned/register')}>
                                <div className="feature-icon">🚨</div>
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
                        <button className="write-post-btn small" onClick={() => navigate('/community/createPost')}>
                            글 작성하기
                        </button>
                    </div>
                    <div className="post-list-table-wrap">
                        <table className="post-list-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>썸네일</th>
                                    <th style={{ width: '60px' }}>카테고리</th>
                                    <th style={{ width: '70px' }}>제목</th>
                                    <th style={{ width: '60px' }}>작성자</th>
                                    <th style={{ width: '60px' }}>작성일</th>
                                    <th style={{ width: '150px' }}>미리보기</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center' }}>게시글이 없습니다.</td></tr>
                                ) : (
                                    posts.map(post => (
                                        <tr
                                            className="post-list-row"
                                            key={post.id}
                                            onClick={() => navigate(`/community/${post.id}`)}
                                        >
                                            <td>
                                                {post.imgUrlContent ? (
                                                    <img src={post.imgUrlContent} alt="썸네일" className="post-list-thumb" />
                                                ) : (
                                                    <div className="post-list-noimg">-</div>
                                                )}
                                            </td>
                                            <td><span className="post-list-category">{post.postType}</span></td>
                                            <td className="post-list-title">{post.title}</td>
                                            <td className="post-list-author">{post.userId || '익명'}</td>
                                            <td>{post.createdAt?.slice(0, 10)}</td>
                                            <td className="post-list-preview">{post.content?.replace(/<[^>]+>/g, '').slice(0, 50)}...</td>
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
