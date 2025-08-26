import React, { useEffect, useState, useRef } from "react";

function KakaoMap({ onSelectLocation, latitude, longitude }) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isCurrentMarkerActive, setIsCurrentMarkerActive] = useState(false); // 현재 위치 마커 활성화 상태
    const currentMarkerObjRef = useRef(null); // 현재 위치 마커 객체를 ref로 관리

    // 현재 위치 가져오기
    const getCurrentLocation = () => {
        setIsLoadingLocation(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('이 브라우저는 Geolocation을 지원하지 않습니다.');
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: currentLat, longitude: currentLng } = position.coords;
                setCurrentLocation({
                    latitude: currentLat,
                    longitude: currentLng,
                    accuracy: position.coords.accuracy
                });
                setIsLoadingLocation(false);

                // 부모 컴포넌트에 현재 위치 전달
                onSelectLocation({
                    latitude: currentLat,
                    longitude: currentLng,
                });
            },
            (error) => {
                let errorMessage = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '위치 정보 접근이 거부되었습니다.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
                        break;
                    default:
                        errorMessage = '알 수 없는 오류가 발생했습니다.';
                        break;
                }
                setLocationError(errorMessage);
                setIsLoadingLocation(false);
            },
            {
                enableHighAccuracy: true, // 높은 정확도
                timeout: 10000, // 10초 타임아웃
                maximumAge: 60000 // 1분 캐시
            }
        );
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=0002645a847652028848c550afe30640&autoload=false&libraries=services`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById("map");

                // 현재 위치가 있으면 현재 위치를, 없으면 기본 위치(서울시청)를 사용
                const center = (currentLocation?.latitude && currentLocation?.longitude)
                    ? new window.kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
                    : (latitude && longitude)
                        ? new window.kakao.maps.LatLng(parseFloat(latitude), parseFloat(longitude))
                        : new window.kakao.maps.LatLng(37.5665, 126.9780);

                const options = {
                    center,
                    level: 3,
                };

                const map = new window.kakao.maps.Map(container, options);

                let marker = new window.kakao.maps.Marker({
                    position: center,
                    map: map,
                    title: '선택된 위치'
                });

                // 현재 위치 마커 (기본 마커와 동일한 스타일)
                if (currentLocation?.latitude && currentLocation?.longitude) {
                    console.log('현재 위치 마커 생성 중:', currentLocation);

                    const currentMarker = new window.kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
                    const newCurrentMarkerObj = new window.kakao.maps.Marker({
                        position: currentMarker,
                        map: map,
                        title: '현재 위치'
                    });

                    // 현재 위치 마커 객체를 ref에 저장
                    currentMarkerObjRef.current = newCurrentMarkerObj;

                    console.log('현재 위치 마커 객체:', newCurrentMarkerObj);

                    // 현재 위치 마커 클릭 이벤트 추가
                    window.kakao.maps.event.addListener(newCurrentMarkerObj, "click", function () {
                        console.log('현재 위치 마커 클릭됨!');

                        // 현재 위치 마커 활성화 상태 토글
                        setIsCurrentMarkerActive(!isCurrentMarkerActive);

                        if (isCurrentMarkerActive) {
                            // 비활성화 상태로 전환
                            console.log('현재 위치 마커 비활성화');
                        } else {
                            // 활성화 상태로 전환
                            console.log('현재 위치 마커 활성화 - 지도를 클릭하면 마커가 이동합니다');
                            // 선택된 위치 마커도 현재 위치로 설정
                            marker.setPosition(newCurrentMarkerObj.getPosition());

                            // 부모 컴포넌트에 현재 위치 전달
                            onSelectLocation({
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                            });
                        }
                    });



                    // 현재 위치로 지도 이동
                    map.setCenter(currentMarker);
                }

                // 지도 클릭 이벤트
                window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
                    const latlng = mouseEvent.latLng;

                    if (isCurrentMarkerActive && currentMarkerObjRef.current) {
                        // 현재 위치 마커가 활성화된 상태라면 현재 위치 마커를 이동
                        console.log('현재 위치 마커를 새로운 위치로 이동:', latlng.getLat(), latlng.getLng());
                        currentMarkerObjRef.current.setPosition(latlng);

                        // 현재 위치 상태 업데이트
                        setCurrentLocation({
                            latitude: latlng.getLat(),
                            longitude: latlng.getLng(),
                            accuracy: currentLocation?.accuracy || 0
                        });

                        // 선택된 위치 마커도 새로운 위치로 이동
                        marker.setPosition(latlng);

                        // 부모 컴포넌트에 새로운 위치 전달
                        onSelectLocation({
                            latitude: latlng.getLat(),
                            longitude: latlng.getLng(),
                        });

                        // 현재 위치 마커 비활성화
                        setIsCurrentMarkerActive(false);
                    } else {
                        // 일반적인 지도 클릭 - 선택된 위치 마커만 이동
                        marker.setPosition(latlng);

                        onSelectLocation({
                            latitude: latlng.getLat(),
                            longitude: latlng.getLng(),
                        });
                    }
                });

                // 선택된 위치 마커 클릭 이벤트
                window.kakao.maps.event.addListener(marker, "click", function () {
                    const position = marker.getPosition();
                    onSelectLocation({
                        latitude: position.getLat(),
                        longitude: position.getLng(),
                    });
                });
            });
        };

        document.head.appendChild(script);

        // cleanup
        return () => {
            document.head.removeChild(script);
        };
    }, [latitude, longitude, onSelectLocation, currentLocation]);

    return (
        <div>
            {/* 에러 메시지 */}
            {locationError && (
                <div style={{
                    color: "red",
                    fontSize: "12px",
                    marginBottom: "10px",
                    padding: "8px",
                    backgroundColor: "#ffebee",
                    borderRadius: "4px",
                    border: "1px solid #ffcdd2"
                }}>
                    ❌ {locationError}
                </div>
            )}

            {/* 현재 위치 정보 */}
            {currentLocation && (
                <div style={{
                    fontSize: "12px",
                    marginBottom: "10px",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    border: "1px solid #e0e0e0"
                }}>
                    <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                        📍 현재 위치 정보
                    </p>
                    <p style={{ margin: "0 0 5px 0" }}>
                        위도: {currentLocation.latitude.toFixed(6)}, 경도: {currentLocation.longitude.toFixed(6)}
                        {currentLocation.accuracy && ` (정확도: ±${Math.round(currentLocation.accuracy)}m)`}
                    </p>
                    <p style={{ margin: "0 0 5px 0", fontSize: "11px", color: "#666" }}>
                        💡 현재 위치 마커를 클릭하면 활성화되고, 지도를 클릭하여 마커를 이동시킬 수 있습니다.
                    </p>
                    {isCurrentMarkerActive && (
                        <p style={{ margin: "0", color: "#4CAF50", fontWeight: "bold" }}>
                            ✓ 활성화됨 - 지도를 클릭하면 마커가 이동합니다
                        </p>
                    )}
                </div>
            )}

            <div style={{ position: "relative" }}>
                <div id="map" style={{ width: "100%", height: "300px", marginBottom: "20px" }}></div>

                {/* 지도 위 현재 위치 버튼 */}
                <button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    style={{
                        position: "absolute",
                        bottom: "20px",
                        right: "20px",
                        width: "40px",
                        height: "40px",
                        backgroundColor: "white",
                        border: "2px solid #ccc",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                        zIndex: 1000
                    }}
                    title="현재 위치로 이동"
                >
                    {isLoadingLocation ? "⏳" : "📍"}
                </button>
            </div>
        </div>
    );
}

export default KakaoMap;
