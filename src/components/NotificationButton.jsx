import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import './NotificationButton.css';

const NotificationButton = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // 디버깅: userId 확인
    console.log('NotificationButton 렌더링 - userId:', userId);

    // 저장된 알림 불러오기
    useEffect(() => {
        if (!userId) return;

        const loadSavedNotifications = async () => {
            try {
                // 읽지 않은 알림만 가져오기
                const response = await axios.get(`/api/notifications/user/${userId}/unread`);
                setNotifications(response.data);
                setUnreadCount(response.data.length);

                console.log('읽지 않은 알림 불러오기 완료:', response.data.length, '개');
            } catch (error) {
                console.error('알림 불러오기 실패:', error);
            }
        };

        loadSavedNotifications();
    }, [userId]);

    // 웹소켓 연결
    useEffect(() => {
        console.log('useEffect 실행 - userId:', userId);

        if (!userId) {
            console.log('userId가 없어서 웹소켓 연결을 건너뜁니다.');
            return;
        }

        console.log('웹소켓 연결 시도 중...');
        console.log('현재 사용자:', userId, '관리자 여부:', userId === 'admin');
        console.log('관리자 알림 구독 여부:', userId === 'admin' ? '구독함' : '구독안함');

        // 백엔드가 실행 중인지 확인
        if (!window.location.hostname.includes('localhost') || window.location.port !== '3000') {
            console.log('개발 환경이 아니므로 웹소켓 연결을 건너뜁니다.');
            return;
        }

        const socket = new SockJS('/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('웹소켓 연결 성공:', frame);

            // 유기견 제보 승인 알림 구독
            stompClient.subscribe(`/topic/user/abandoned/${userId}`, function (notification) {
                const data = JSON.parse(notification.body);
                console.log('유기견 제보 승인 알림 수신:', data);

                setNotifications(prev => [data, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            // 입양 관련 알림 구독
            stompClient.subscribe(`/topic/user/${userId}/adoption`, function (notification) {
                const data = JSON.parse(notification.body);
                console.log('입양 승인 알림 수신:', data);

                setNotifications(prev => [data, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            // 커뮤니티 댓글 알림 구독
            stompClient.subscribe(`/topic/user/${userId}/community/comment`, function (notification) {
                const data = JSON.parse(notification.body);
                console.log('커뮤니티 댓글 알림 수신:', data);

                setNotifications(prev => [data, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
            // 커뮤니티 좋아요 알림 구독
            stompClient.subscribe(`/topic/user/${userId}/community/like`, function (notification) {
                const data = JSON.parse(notification.body);
                console.log('커뮤니티 좋아요 알림 수신:', data);

                setNotifications(prev => [data, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            if (userId === 'admin' || (window.userRole && window.userRole === 'ADMIN')) {
                const adminTopics = [
                    '/topic/admin/abandoned/alerts',
                    '/topic/admin/adoption/alerts',
                ];

                adminTopics.forEach(topic => {
                    stompClient.subscribe(topic, function (notification) {
                        const data = JSON.parse(notification.body);
                        console.log('관리자 알림 수신:', data);

                        setNotifications(prev => [data, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    });
                });
            }


        }, function (error) {
            console.error('웹소켓 연결 실패:', error);
            // 연결 실패 시 재시도하지 않고 조용히 처리
            console.log('웹소켓 연결이 실패했지만 앱은 정상 작동합니다.');
        });

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [userId]);

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // 알림창을 열 때 모든 알림을 읽음으로 표시
            markAllAsRead();
            setUnreadCount(0);
        }
    };

    const markAllAsRead = async () => {
        if (!userId) return;

        try {
            await axios.put(`/api/notifications/user/${userId}/read-all`);
            console.log('모든 알림을 읽음으로 표시했습니다.');
        } catch (error) {
            console.error('알림 읽음 표시 실패:', error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return '방금 전';
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'ADOPTION_REQUEST':
                return '😇';
            case 'ADOPTION_RESULT':
                return '🐕';
            case 'COMMENT':
                return '💬';
            case 'LIKE':
                return '❤️';
            case 'ABANDONED_PET':
                return '🏠';
            case 'ADMIN_ALERT':
                return '🔔';
            default:
                return '🔔';
        }
    };

    // 개별 알림 읽음 처리 함수
    const markNotificationAsRead = async (notification, index) => {
        try {
            // 백엔드 API가 있다면 호출
            if (notification.id) {
                await axios.put(`/api/notifications/${notification.id}/read`);
            }

            // 프론트엔드에서 해당 알림 제거
            setNotifications(prev => prev.filter((_, i) => i !== index));
            setUnreadCount(prev => Math.max(0, prev - 1));

            console.log('알림을 읽음으로 처리했습니다.');
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
            // 에러가 나도 프론트엔드에서는 제거
            setNotifications(prev => prev.filter((_, i) => i !== index));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    return (
        <div className="notification-container">
            <button
                className="notification-button"
                onClick={toggleNotifications}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>알림</h3>
                        <button
                            className="close-button"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                새로운 알림이 없습니다.
                            </div>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={index} className="notification-item">
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.notificationType)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-message">
                                            {notification.message || '새로운 알림이 있습니다.'}
                                        </div>
                                        <div className="notification-time">
                                            {formatTime(notification.createdAt || notification.timestamp)}
                                        </div>
                                    </div>
                                    <button
                                        className="notification-delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markNotificationAsRead(notification, index);
                                        }}
                                        title="알림 읽음으로 표시"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationButton; 