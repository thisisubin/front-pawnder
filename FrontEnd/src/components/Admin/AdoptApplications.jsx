import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/Header';
import './AdoptApplications.css';

function AdoptApplications() {
    const [applications, setApplications] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
        fetchApplications();
    }, []);

    const fetchUserData = async () => {
        try {
            const userResponse = await axios.get('/api/users/check-session', {
                withCredentials: true
            });
            setUser(userResponse.data);

            // 관리자가 아니면 접근 제한
            if (userResponse.data.username !== 'admin') {
                alert('관리자만 접근할 수 있습니다.');
                navigate('/');
                return;
            }
        } catch (error) {
            console.error('사용자 정보 로딩 실패:', error);
            navigate('/');
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/api/admin/adopt-applications', {
                withCredentials: true

            });
            console.log('응답 데이터:', response.data); // 👈 이걸 추가해서 adoptStatus가 존재하는지 확인
            setApplications(response.data || []);
        } catch (error) {
            console.error('입양 신청 목록 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {

        console.log("handleApprove id:", id);
        if (window.confirm('정말로 이 입양 신청을 승인하시겠습니까?')) {
            setProcessingId(id);
            try {
                const response = await axios.post(`/api/admin/adopt/approve/${id}`, {}, {
                    withCredentials: true
                });
                alert('입양 신청이 승인되었습니다!');
                fetchApplications(); // 목록 새로고침
            } catch (error) {
                console.error('입양 승인 실패:', error);
                alert('입양 승인 중 오류가 발생했습니다.');
            } finally {
                setProcessingId(null);
            }
        }
    };

    const getStatusText = (adoptStatus) => {
        switch (adoptStatus) {
            case 'REQUESTED':
                return '대기중';
            case 'APPROVED':
                return '승인됨';
            case 'REJECTED':
                return '거절됨';
            default:
                return '알 수 없음';
        }
    };

    const getStatusColor = (adoptStatus) => {
        switch (adoptStatus) {
            case 'REQUESTED':
                return '#ffc107';
            case 'APPROVED':
                return '#28a745';
            case 'REJECTED':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    if (loading) {
        return (
            <>
                <Header user={user} />
                <div className="adopt-applications-loading">
                    <div className="loading-spinner"></div>
                    <p>입양 신청 목록을 불러오는 중...</p>
                </div>
            </>
        );
    }

    return (

        <>
            <Header user={user} />
            <div className="adopt-applications-container">
                <div className="adopt-applications-header">
                    <h1>📝 입양 신청 관리</h1>
                    <p>사용자들의 입양 신청을 관리하고 승인/거절을 처리하세요.</p>
                </div>

                {applications.length === 0 ? (
                    <div className="no-applications">
                        <div className="no-applications-icon">📋</div>
                        <h2>입양 신청이 없습니다</h2>
                        <p>현재 대기중인 입양 신청이 없습니다.</p>
                    </div>
                ) : (
                    <div className="applications-grid">
                        {applications.map((application) => {
                            console.log('개별 application 데이터:', application); // 디버깅용
                            return (
                                <div key={application.id || Math.random()} className="application-card">
                                    <div className="application-header">
                                        <h3 className="application-title">
                                            입양 신청 #{application.id || 'N/A'}
                                        </h3>
                                        <div
                                            className="application-status"
                                            style={{ backgroundColor: getStatusColor(application.adoptStatus) }}
                                        >
                                            {getStatusText(application.adoptStatus)}
                                        </div>
                                    </div>

                                    <div className="application-info">
                                        <div className="info-section">
                                            <h4>신청자 정보</h4>
                                            <p><strong>신청자:</strong> {application.userName || '알 수 없음'}</p>
                                            <p><strong>신청일:</strong> {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('ko-KR') : '알 수 없음'}</p>
                                            {application.approvedAt && (
                                                <p><strong>승인일:</strong> {new Date(application.approvedAt).toLocaleDateString('ko-KR')}</p>
                                            )}
                                        </div>

                                        <div className="info-section">
                                            <h4>유기견 정보</h4>
                                            <p><strong>발견된 지역:</strong> {application.location || '알 수 없음'}</p>
                                            <p><strong>추측 품종:</strong> {application.petType || '알 수 없음'}</p>
                                            <p><strong>상태:</strong> {application.adoptStatus || '알 수 없음'}</p>

                                            <div className="pet-image-container">
                                                <p><strong>유기견 사진:</strong></p>
                                                <img
                                                    src={application.petImageUrl}
                                                    alt="유기견 사진"
                                                    className="pet-image"
                                                />
                                            </div>

                                        </div>

                                        {application.adoptStatus === 'REQUESTED' && (
                                            <div className="application-actions">
                                                <button
                                                    className="approve-btn"
                                                    onClick={() => handleApprove(application.id || application.adoptPetId)}
                                                    disabled={processingId === (application.id || application.adoptPetId)}
                                                >
                                                    {processingId === (application.id || application.adoptPetId) ? '처리 중...' : '승인'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

export default AdoptApplications; 