const map = L.map('map').setView([35.681236, 139.767125], 13);

// 地図表示
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 要素
const speedText = document.getElementById("speed");
const distanceText = document.getElementById("distance");
const followBtn = document.getElementById("followBtn");

// 現在地追従モード
let followMode = true;

// ボタン
followBtn.addEventListener("click", () => {

    followMode = !followMode;

    if (followMode) {

        followBtn.textContent = "追従: ON";

    } else {

        followBtn.textContent = "追従: OFF";
    }
});

// マーカー
const gpsIcon = L.icon({

    iconUrl: 'location.png',

    iconSize: [40, 40],

    iconAnchor: [20, 20]
});

let marker;

// 経路
let path = [];

// 線
let polyline = L.polyline(path, {
    color: 'blue',
    weight: 5
}).addTo(map);

// 距離
let totalDistance = 0;

// 前回位置
let previousLat = null;
let previousLng = null;

// GPS追跡
navigator.geolocation.watchPosition(
    success,
    error,
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    }
);

// 成功
function success(position) {

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // 速度
    let speed = position.coords.speed;

    // null対策
    if (speed === null) {
        speed = 0;
    }

    // m/s → km/h
    speed = (speed * 3.6).toFixed(1);

    speedText.textContent =
        `速度: ${speed} km/h`;

    // 地図追従
    if (followMode) {
        map.setView([lat, lng], 17);
    }

    // 線追加
    path.push([lat, lng]);

    polyline.setLatLngs(path);

    // 距離計算
    if (previousLat !== null) {

        const distance = getDistance(
            previousLat,
            previousLng,
            lat,
            lng
        );

        totalDistance += distance;
    }

    previousLat = lat;
    previousLng = lng;

    // 表示
    if (totalDistance < 1000) {

        distanceText.textContent =
            `移動距離: ${totalDistance.toFixed(1)} m`;

    } else {

        distanceText.textContent =
            `移動距離: ${(totalDistance / 1000).toFixed(2)} km`;
    }

    // マーカー
    if (!marker) {

       marker = L.marker(
    [lat, lng],
    {
        icon: gpsIcon
    }
    )
            .addTo(map)
            .bindPopup("現在地")
            .openPopup();

    } else {

        marker.setLatLng([lat, lng]);
    }
}

// エラー
function error(err) {

    console.log(err);

    alert("位置情報を取得できません");
}

// 距離計算
function getDistance(lat1, lng1, lat2, lng2) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLng =
        (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}
