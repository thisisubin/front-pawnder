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

    currentMarkerObjRef

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
