import React, { useEffect } from "react";

function KakaoMap({ onSelectLocation, latitude, longitude }) {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=0002645a847652028848c550afe30640&autoload=false&libraries=services`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById("map");

                const center = (latitude && longitude)
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
                });

                window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
                    const latlng = mouseEvent.latLng;
                    marker.setPosition(latlng);

                    onSelectLocation({
                        latitude: latlng.getLat(),
                        longitude: latlng.getLng(),
                    });
                });
            });
        };

        document.head.appendChild(script);

        // cleanup
        return () => {
            document.head.removeChild(script);
        };
    }, [latitude, longitude, onSelectLocation]);

    return (
        <div id="map" style={{ width: "100%", height: "300px", marginBottom: "20px" }}></div>
    );
}

export default KakaoMap;
