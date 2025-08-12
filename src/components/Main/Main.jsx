import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';
import axios from 'axios';
import './Main.css';

function Main({ user }) {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [abandonedPets, setAbandonedPets] = useState([]);

    // abandonedPets가 항상 배열인지 확인하는 안전한 getter
    const safeAbandonedPets = Array.isArray(abandonedPets) ? abandonedPets : [];
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [hoveredPetId, setHoveredPetId] = useState(null);

    // 관리자 대시보드 관련 상태
    const [adminDashboardData, setAdminDashboardData] = useState(null);
    const [adminLoading, setAdminLoading] = useState(false);
    const [realTimeData, setRealTimeData] = useState({
        reportsAdoptions: {},
        donations: {},
        abandonedStatus: {},
        recentActivities: []
    });
    const [chartData, setChartData] = useState({
        dailyReports: [],
        monthlyDonations: [],
        adoptionTrends: []
    });
    const [recentActivities, setRecentActivities] = useState([]);

    // Socket 연결
    const socketRef = useRef();

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const petsResponse = await axios.get('/api/pet/profile/pets', {
                    withCredentials: true
                });

                // 데이터가 배열인지 확인
                if (Array.isArray(petsResponse.data)) {
                    setPets(petsResponse.data);
                } else {
                    console.log('pets 데이터가 배열이 아님:', petsResponse.data);
                    setPets([]);
                }
            } catch (error) {
                console.error('반려견 정보 로딩 실패:', error);

                // 소셜 로그인 사용자인지 확인
                const isSocialUser = user?.provider || user?.socialId;
                console.log('Main - 소셜 로그인 사용자 여부:', isSocialUser);

                if (error.response?.status === 401) {
                    console.log('Main - 401 에러 발생');

                    if (isSocialUser) {
                        console.log('소셜 로그인 사용자 401 에러 - 세션 재확인 시도');
                        try {
                            const sessionResponse = await axios.get('/api/users/check-session', {
                                withCredentials: true
                            });
                            console.log('세션 재확인 성공:', sessionResponse.data);

                            // 세션이 유효하면 페이지 새로고침
                            window.location.reload();
                            return;
                        } catch (sessionError) {
                            console.log('세션 재확인 실패:', sessionError);
                        }
                    }

                    alert('로그인이 필요합니다.');
                    return;
                }

                setPets([]);
            }
        };

        const fetchAbandonedPets = async () => {
            try {
                console.log('유기견 데이터 요청 시작...');
                const response = await axios.get('/api/abandoned/abandoned-pets', {
                    withCredentials: true
                });
                console.log('유기견 API 응답:', response.data);
                console.log('응답 데이터 타입:', typeof response.data);
                console.log('응답 데이터 길이:', response.data?.length);
                console.log('Array.isArray(response.data):', Array.isArray(response.data));

                // 응답 데이터가 배열인지 확인하고 안전하게 처리
                let petsData = [];
                if (Array.isArray(response.data)) {
                    petsData = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    // 객체인 경우 data 필드 확인
                    petsData = Array.isArray(response.data.data) ? response.data.data : [];
                }

                // 최대 8개만 표시 (캐러셀 용)
                const limitedPets = petsData.slice(0, 8);
                console.log('캐러셀용 제한된 데이터:', limitedPets);
                setAbandonedPets(limitedPets);
            } catch (error) {
                console.error('유기견 정보 로딩 실패:', error);
                console.error('에러 상세:', error.response?.data);
                console.error('에러 상태:', error.response?.status);
                setAbandonedPets([]);
            }
        };

        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchPets(), fetchAbandonedPets()]);
            setLoading(false);
        };

        loadData();
    }, [user]);

    // 관리자 대시보드 데이터 로드
    useEffect(() => {
        console.log('관리자 대시보드 useEffect 실행됨');
        console.log('현재 사용자 정보:', user);
        console.log('사용자 역할:', user?.role);

        if (user?.role === 'ADMIN') {
            console.log('관리자 권한 확인됨 - 대시보드 데이터 로딩 시작');

            const fetchAdminDashboardData = async () => {
                setAdminLoading(true);
                try {
                    console.log('관리자 대시보드 데이터 요청 시작...');
                    console.log('현재 사용자 정보:', user);

                    // 각 API를 개별적으로 호출하여 어떤 API에서 문제가 발생하는지 확인
                    let reportsAdoptions, donations, abandonedStatus;

                    try {
                        console.log('reports-adoptions API 호출 시도...');
                        reportsAdoptions = await axios.get('/api/admin/dashboard/reports-adoptions', {
                            withCredentials: true
                        });
                        console.log('reports-adoptions 응답 성공:', reportsAdoptions.data);
                    } catch (error) {
                        console.error('reports-adoptions API 호출 실패:', error);
                        console.error('에러 응답:', error.response?.data);
                        console.error('에러 상태:', error.response?.status);
                        console.error('에러 헤더:', error.response?.headers);
                        reportsAdoptions = { data: { reportCount: 0, adoptionCount: 0, pendingReports: 0, pendingAdoptions: 0 } };
                    }

                    try {
                        console.log('donations API 호출 시도...');
                        donations = await axios.get('/api/admin/dashboard/donations', {
                            withCredentials: true
                        });
                        console.log('donations 응답 성공:', donations.data);
                    } catch (error) {
                        console.error('donations API 호출 실패:', error);
                        console.error('에러 응답:', error.response?.data);
                        console.error('에러 상태:', error.response?.status);
                        console.error('에러 헤더:', error.response?.headers);
                        donations = { data: { totalAmount: 0, monthlyCount: 0 } };
                    }

                    try {
                        console.log('abandoned-status API 호출 시도...');
                        abandonedStatus = await axios.get('/api/admin/dashboard/abandoned-status', {
                            withCredentials: true
                        });
                        console.log('abandoned-status 응답 성공:', abandonedStatus.data);
                    } catch (error) {
                        console.error('abandoned-status API 호출 실패:', error);
                        console.error('에러 응답:', error.response?.data);
                        console.error('에러 상태:', error.response?.status);
                        console.error('에러 헤더:', error.response?.headers);
                        abandonedStatus = { data: { lost: 0, protecting: 0, waiting: 0, adopt: 0 } };
                    }

                    console.log('백엔드 응답 데이터:', {
                        reportsAdoptions: reportsAdoptions.data,
                        donations: donations.data,
                        abandonedStatus: abandonedStatus.data
                    });

                    // 디버깅: 각 API 응답 구조 확인
                    console.log('=== API 응답 구조 디버깅 ===');
                    console.log('reportsAdoptions 구조:', JSON.stringify(reportsAdoptions.data, null, 2));
                    console.log('donations 구조:', JSON.stringify(donations.data, null, 2));
                    console.log('abandonedStatus 구조:', JSON.stringify(abandonedStatus.data, null, 2));

                    // 백엔드 응답 구조에 맞게 데이터 매핑
                    const dashboardData = {
                        reportsAdoptions: reportsAdoptions.data,
                        donations: donations.data,
                        abandonedStatus: abandonedStatus.data
                    };

                    setAdminDashboardData(dashboardData);

                    // 실시간 데이터 초기화
                    setRealTimeData({
                        reportsAdoptions: {
                            totalReports: dashboardData.reportsAdoptions.reportCount || 0,
                            totalAdoptions: dashboardData.reportsAdoptions.adoptionCount || 0,
                            pendingReports: dashboardData.reportsAdoptions.pendingReports || 0,
                            pendingAdoptions: dashboardData.reportsAdoptions.pendingAdoptions || 0
                        },
                        donations: {
                            totalAmount: dashboardData.donations.totalAmount || 0,
                            monthlyCount: dashboardData.donations.monthlyCount || 0
                        },
                        abandonedStatus: {
                            totalAbandoned: (dashboardData.abandonedStatus.lost || 0) +
                                (dashboardData.abandonedStatus.protecting || 0) +
                                (dashboardData.abandonedStatus.waiting || 0),
                            adoptedCount: dashboardData.abandonedStatus.adopt || 0
                        },
                        recentActivities: []
                    });

                    // 차트 데이터 초기화 (실제 백엔드 데이터 기반)
                    const chartDataToSet = {
                        // 백엔드에서 제공하는 실제 데이터 기반으로 차트 구성
                        adoptionStatus: [
                            { name: '실종', value: dashboardData.abandonedStatus.lost || 0, color: '#ff6b6b' },
                            { name: '보호 중', value: dashboardData.abandonedStatus.protecting || 0, color: '#4ecdc4' },
                            { name: '입양 대기', value: dashboardData.abandonedStatus.waiting || 0, color: '#45b7d1' },
                            { name: '입양 완료', value: dashboardData.abandonedStatus.adopt || 0, color: '#96ceb4' }
                        ],

                        // 제보 vs 입양 비교 차트
                        reportsVsAdoptions: [
                            { name: '유기견 제보', value: dashboardData.reportsAdoptions.reportCount || 0, color: '#ff6b6b' },
                            { name: '입양 신청', value: dashboardData.reportsAdoptions.adoptionCount || 0, color: '#4ecdc4' }
                        ],

                        // 처리 현황 차트
                        processingStatus: [
                            { name: '처리 완료', value: (dashboardData.reportsAdoptions.reportCount || 0) + (dashboardData.reportsAdoptions.adoptionCount || 0), color: '#96ceb4' },
                            { name: '처리 대기', value: (dashboardData.reportsAdoptions.pendingReports || 0) + (dashboardData.reportsAdoptions.pendingAdoptions || 0), color: '#ffd93d' }
                        ],

                        // 후원금 통계 (백엔드에서 제공하는 실제 데이터 사용)
                        donationStats: {
                            totalAmount: dashboardData.donations.totalAmount || 0,
                            monthlyTrend: dashboardData.donations.monthlyTrend || []
                        }
                    };

                    console.log('=== 차트 데이터 설정 ===');
                    console.log('설정할 차트 데이터:', JSON.stringify(chartDataToSet, null, 2));
                    console.log('입양 상태 분포:', chartDataToSet.adoptionStatus);
                    console.log('제보 vs 입양:', chartDataToSet.reportsVsAdoptions);
                    console.log('처리 현황:', chartDataToSet.processingStatus);
                    console.log('후원금 통계:', chartDataToSet.donationStats);

                    setChartData(chartDataToSet);

                } catch (error) {
                    console.error('관리자 대시보드 데이터 로딩 실패:', error);
                    console.error('에러 상세:', error.response?.data);
                    console.error('에러 상태:', error.response?.status);

                    // 에러 발생 시 기본 데이터로 초기화
                    setRealTimeData({
                        reportsAdoptions: { totalReports: 0, totalAdoptions: 0, pendingReports: 0, pendingAdoptions: 0 },
                        donations: { totalAmount: 0, monthlyCount: 0 },
                        abandonedStatus: { totalAbandoned: 0, adoptedCount: 0 },
                        recentActivities: []
                    });
                } finally {
                    setAdminLoading(false);
                }
            };

            fetchAdminDashboardData();

            // Socket.IO 연결 (관리자 대시보드용)
            socketRef.current = io('http://localhost:9092');

            socketRef.current.on('connect', () => {
                console.log('관리자 대시보드에 연결되었습니다.');
                // 대시보드 참여 이벤트 전송
                socketRef.current.emit('join_dashboard', 'admin');
            });

            socketRef.current.on('connected', (message) => {
                console.log('서버 응답:', message);
            });

            socketRef.current.on('dashboard_joined', (message) => {
                console.log('대시보드 참여:', message);
            });

            // 실시간 대시보드 업데이트
            socketRef.current.on('dashboard_update', (data) => {
                console.log('대시보드 업데이트:', data);
                setRealTimeData(prev => ({ ...prev, ...data }));

                // 최근 활동에 추가
                if (data.message) {
                    setRecentActivities(prev => [
                        {
                            type: data.type || 'dashboard_update',
                            message: data.message,
                            timestamp: new Date()
                        },
                        ...prev.slice(0, 9) // 최근 10개만 유지
                    ]);
                }
            });

            // 새 사용자 등록 이벤트
            socketRef.current.on('user_registered', (data) => {
                console.log('새 사용자 등록:', data);
                // 실시간 사용자 수 업데이트
                setRealTimeData(prev => ({
                    ...prev,
                    reportsAdoptions: {
                        ...prev.reportsAdoptions,
                        totalReports: (prev.reportsAdoptions?.totalReports || 0) + 1
                    }
                }));

                // 최근 활동에 추가
                setRecentActivities(prev => [
                    {
                        type: 'user_registered',
                        message: '새로운 사용자가 등록되었습니다.',
                        timestamp: new Date(),
                        userId: data.userId
                    },
                    ...prev.slice(0, 9) // 최근 10개만 유지
                ]);
            });

            // 새 입양 신청 이벤트
            socketRef.current.on('pet_adopted', (data) => {
                console.log('새 입양 신청:', data);
                setRealTimeData(prev => ({
                    ...prev,
                    reportsAdoptions: {
                        ...prev.reportsAdoptions,
                        totalAdoptions: (prev.reportsAdoptions?.totalAdoptions || 0) + 1
                    }
                }));

                // 최근 활동에 추가
                setRecentActivities(prev => [
                    {
                        type: 'pet_adopted',
                        message: '새로운 입양 신청이 접수되었습니다.',
                        timestamp: new Date(),
                        petId: data.petId,
                        userId: data.userId
                    },
                    ...prev.slice(0, 9) // 최근 10개만 유지
                ]);
            });

            // 차트 데이터 업데이트
            socketRef.current.on('chart-data-update', (data) => {
                setChartData(prev => ({ ...prev, ...data }));
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.off('connect');
                    socketRef.current.off('connected');
                    socketRef.current.off('dashboard_joined');
                    socketRef.current.off('dashboard_update');
                    socketRef.current.off('user_registered');
                    socketRef.current.off('pet_adopted');
                    socketRef.current.off('chart-data-update');
                    socketRef.current.close();
                }
            };
        }
    }, [user]);

    // 캐러셀 네비게이션 함수
    const nextSlide = () => {
        if (safeAbandonedPets.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % Math.ceil(safeAbandonedPets.length / 4));
        }
    };

    const prevSlide = () => {
        if (safeAbandonedPets.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + Math.ceil(safeAbandonedPets.length / 4)) % Math.ceil(safeAbandonedPets.length / 4));
        }
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    if (loading) {
        return (
            <div className="main-page-loading">
                <div className="main-loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="main-page-container">
            <main className="main-page-content">
                <section className="main-welcome-section">
                    <h2>🐾 Pawnder에 오신 것을 환영합니다!</h2>
                    <p>반려견과 함께하는 따뜻한 세상을 만들어보세요</p>
                </section>

                {/* 소셜 로그인 사용자 디버깅 정보 */}
                {user && (user.provider || user.socialId) && (
                    <div style={{
                        background: '#f8f9fa',
                        padding: '10px',
                        margin: '10px 0',
                        borderRadius: '5px',
                        fontSize: '12px',
                        color: '#666'
                    }}>
                        <strong>소셜 사용자 정보:</strong><br />
                        Provider: {user.provider || '없음'}<br />
                        소셜 ID: {user.socialId || '없음'}<br />
                        사용자 ID: {user.userId || '없음'}<br />
                        사용자명: {user.username || '없음'}
                    </div>
                )}

                <section className="main-welcome-section">
                    <div className="main-abandoned-pets-section">
                        <h3>💝 유기견을 후원해주세요</h3>
                        <p>도움이 필요한 아이들을 만나보세요</p>

                        {safeAbandonedPets.length > 0 ? (
                            <div className="main-carousel-container">
                                <button
                                    className="main-carousel-nav prev"
                                    onClick={prevSlide}
                                    disabled={abandonedPets.length <= 4}
                                >
                                    ‹
                                </button>

                                <div className="main-carousel-wrapper">
                                    <div
                                        className="main-carousel-track"
                                        style={{
                                            transform: `translateX(-${currentSlide * 100}%)`
                                        }}
                                    >
                                        {Array.from({ length: Math.ceil(safeAbandonedPets.length / 4) }, (_, slideIndex) => (
                                            <div key={slideIndex} className="main-carousel-slide">
                                                {safeAbandonedPets
                                                    .slice(slideIndex * 4, (slideIndex + 1) * 4)
                                                    .map((pet) => (
                                                        <div
                                                            key={pet.id}
                                                            className="main-carousel-pet-card"
                                                            onClick={() => navigate('/adopt')}
                                                            onMouseEnter={() => setHoveredPetId(pet.id)}
                                                            onMouseLeave={() => setHoveredPetId(null)}
                                                        >
                                                            <div className="main-carousel-pet-image">
                                                                {pet.imageUrl ? (
                                                                    <img src={pet.imageUrl} alt={pet.type || '유기견'} />
                                                                ) : (
                                                                    <div className="main-carousel-pet-placeholder">🐕</div>
                                                                )}
                                                            </div>
                                                            <div className="main-carousel-pet-info">
                                                                <h4>{pet.type || '이름 없음'}</h4>
                                                                <p className="main-pet-location">{pet.location || '위치 정보 없음'}</p>
                                                                {hoveredPetId === pet.id && (
                                                                    <p className="main-pet-status">{pet.status}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="main-carousel-nav next"
                                    onClick={nextSlide}
                                    disabled={safeAbandonedPets.length <= 4}
                                >
                                    ›
                                </button>

                                {Math.ceil(safeAbandonedPets.length / 4) > 1 && (
                                    <div className="main-carousel-dots">
                                        {Array.from({ length: Math.ceil(safeAbandonedPets.length / 4) }, (_, index) => (
                                            <button
                                                key={index}
                                                className={`main-carousel-dot ${currentSlide === index ? 'active' : ''}`}
                                                onClick={() => goToSlide(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="main-no-abandoned-pets">
                                <p>현재 등록된 유기견이 없습니다.</p>
                                <button
                                    onClick={() => navigate('/adopt')}
                                    className="main-view-adopt-btn"
                                >
                                    유기견 목록 보기
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 관리자 대시보드 또는 일반 사용자 반려견 섹션 */}
                <section className="main-pets-section">
                    <h3>{user?.role === 'ADMIN' ? '관리자 대시보드' : '나의 반려견'}</h3>

                    {user?.role === 'ADMIN' ? (
                        // 관리자 대시보드
                        <div className="main-admin-dashboard">
                            {adminLoading ? (
                                <div className="main-admin-loading">
                                    <div className="main-loading-spinner"></div>
                                    <p>관리자 데이터 로딩 중...</p>
                                </div>
                            ) : adminDashboardData ? (
                                <>
                                    {/* 통계 카드들 */}
                                    <div className="main-dashboard-stats">
                                        <div className="main-stat-card">
                                            <h4>유기견 제보 현황</h4>
                                            <p className="main-stat-number">{realTimeData.reportsAdoptions?.totalReports || 0}</p>
                                            <p className="main-stat-detail">처리 대기: {realTimeData.reportsAdoptions?.pendingReports || 0}</p>
                                        </div>

                                        <div className="main-stat-card">
                                            <h4>입양 신청 현황</h4>
                                            <p className="main-stat-number">{realTimeData.reportsAdoptions?.totalAdoptions || 0}</p>
                                            <p className="main-stat-detail">승인 대기: {realTimeData.reportsAdoptions?.pendingAdoptions || 0}</p>
                                        </div>

                                        <div className="main-stat-card">
                                            <h4>총 후원금</h4>
                                            <p className="main-stat-number">₩{(realTimeData.donations?.totalAmount || 0).toLocaleString()}</p>
                                            <p className="main-stat-detail">이번 달: {(realTimeData.donations?.monthlyCount || 0).toLocaleString()}건</p>
                                        </div>

                                        <div className="main-stat-card">
                                            <h4>유기견 현황</h4>
                                            <p className="main-stat-number">{realTimeData.abandonedStatus?.totalAbandoned || 0}</p>
                                            <p className="main-stat-detail">입양 완료: {realTimeData.abandonedStatus?.adoptedCount || 0}</p>
                                        </div>
                                    </div>

                                    {/* 차트 섹션 */}
                                    <div className="main-charts-section">
                                        {/* 유기견 상태별 분포 파이 차트 */}
                                        <div className="main-chart-container">
                                            <h4>유기견 상태별 분포</h4>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={chartData.adoptionStatus}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={false}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {chartData.adoptionStatus.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* 제보 vs 입양 비교 바 차트 */}
                                        <div className="main-chart-container">
                                            <h4>제보 vs 입양 신청 현황</h4>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={chartData.reportsVsAdoptions}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                        {chartData.reportsVsAdoptions.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* 처리 현황 도넛 차트 */}
                                        <div className="main-chart-container">
                                            <h4>처리 현황</h4>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={chartData.processingStatus}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        labelLine={false}
                                                        label={false}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {chartData.processingStatus.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* 빠른 액션 버튼들 */}
                                    <div className="main-quick-actions">
                                        <button
                                            className="main-action-btn primary"
                                            onClick={() => navigate('/admin/abandoned-pets')}
                                        >
                                            유기견 제보 관리
                                        </button>
                                        <button
                                            className="main-action-btn secondary"
                                            onClick={() => navigate('/admin/adopt-applications')}
                                        >
                                            입양 신청 관리
                                        </button>

                                    </div>
                                </>
                            ) : (
                                <div className="main-admin-error">
                                    <p>관리자 데이터를 불러올 수 없습니다.</p>
                                    <button onClick={() => window.location.reload()}>새로고침</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // 일반 사용자 반려견 섹션
                        pets.length === 0 ? (
                            <div className="main-no-pets">
                                <p>등록된 반려견이 없습니다.</p>
                                <button
                                    onClick={() => navigate('/pet/register')}
                                    className="main-add-pet-btn-large"
                                >
                                    첫 반려견 등록하기
                                </button>
                            </div>
                        ) : (
                            <div className="main-pets-grid">
                                {pets.map((pet) => (
                                    <div key={pet.petId} className="main-pet-card" onClick={() => navigate(`/pet/profile/${pet.petId}`)}>
                                        <div className="main-pet-avatar">
                                            {pet.profile ? (
                                                <img src={pet.profile} alt={pet.name} />
                                            ) : (
                                                <div className="main-pet-avatar-placeholder">🐕</div>
                                            )}
                                        </div>
                                        <div className="main-pet-info">
                                            <h4>{pet.name}</h4>
                                            <p>{pet.adopt}</p>
                                            <p className="main-pet-age">{pet.age}살</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </section>

                <section className="main-features-section">
                    <div className="main-features-grid">
                        <div className="main-feature-card" onClick={() => navigate('/adopt')}>
                            <div className="main-feature-icon">🐕</div>
                            <h4>유기견 목록</h4>
                            <p>유기견 정보를 확인하고 </p>
                            <p>입양을 생각해보세요</p>
                        </div>
                        <div className="main-feature-card" onClick={() => navigate('/community')}>
                            <div className="main-feature-icon">💬</div>
                            <h4>커뮤니티</h4>
                            <p>다른 반려인들과 소통하고</p>
                            <p>정보를 공유해보세요</p>
                        </div>
                        {user && user.loggedIn && user.role !== 'ADMIN' && (
                            <div className="main-feature-card" onClick={() => navigate('/mypage')}>
                                <div className="main-feature-icon">👤</div>
                                <h4>마이페이지</h4>
                                <p>내 정보를 수정하고</p>
                                <p>후원견을 관리해보세요</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="main-features-section">
                    <div className="main-features-grid">
                        {user?.role === 'ADMIN' ? (
                            <>
                                <div className="main-feature-card" onClick={() => navigate('/admin/abandoned-pets')}>
                                    <div className="main-feature-icon">📋</div>
                                    <h4>유기견 제보 리스트</h4>
                                    <p>등록된 유기견 제보를 확인하세요.</p>
                                </div>
                                <div className="main-feature-card" onClick={() => navigate('/admin/adopt-applications')}>
                                    <div className="main-feature-icon">📝</div>
                                    <h4>입양 신청 관리</h4>
                                    <p>사용자들의 입양 신청을 관리하세요.</p>
                                </div>
                            </>
                        ) : (
                            <div className="main-feature-card" onClick={() => navigate('/abandoned/register')}>
                                <div className="main-feature-icon">🚨</div>
                                <h4>유기견 제보</h4>
                                <p>유기견을 발견하셨다면, 신고해주세요!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Main;