const map = L.map('map').setView([35.681236, 139.767125], 13);

// 地図表示
// 通常マップ
const normalMap = L.tileLayer(

    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    {
        attribution: '&copy; OpenStreetMap contributors'
    }
);

// 避難用地形マップ
const evacuationMap = L.tileLayer(

    'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',

    {
        attribution: '国土地理院'
    }
);

// 最初は通常マップ表示
normalMap.addTo(map);

// 要素
const speedText = document.getElementById("speed");
const distanceText = document.getElementById("distance");
const followBtn = document.getElementById("followBtn");
const resetBtn = document.getElementById("resetBtn");
// 追加
const evacuationBtn =
    document.getElementById("evacuationBtn");

const toggleGpsBtn =
    document.getElementById("toggleGpsBtn");

const gpsData =
    document.getElementById("gpsData");

const latitudeText =
    document.getElementById("latitude");

const longitudeText =
    document.getElementById("longitude");

const altitudeText =
    document.getElementById("altitude");

const accuracyText =
    document.getElementById("accuracy");

// 現在地追従モード
let followMode = true;

// 追従ON_OFFボタン
followBtn.addEventListener("click", () => {

    followMode = !followMode;

    if (followMode) {

        followBtn.textContent = "追従: ON";

    } else {

        followBtn.textContent = "追従: OFF";
    }
});

// =====================
// 避難モード切替
// =====================

let evacuationMode = false;

evacuationBtn.addEventListener("click", () => {

    evacuationMode = !evacuationMode;

    if (evacuationMode) {

        // 通常地図削除
        map.removeLayer(normalMap);

        // 避難地図追加
        evacuationMap.addTo(map);

        evacuationBtn.textContent =
            "避難モード: ON";

    } else {

        // 避難地図削除
        map.removeLayer(evacuationMap);

        // 通常地図追加
        normalMap.addTo(map);

        evacuationBtn.textContent =
            "避難モード: OFF";
    }
});

//移動距離_マーカーリセットボタン
resetBtn.addEventListener("click", () => {

      if (!confirm("リセットしますか？")) {
        return;
    }
    
    // 距離リセット
    totalDistance = 0;

    // 表示更新
    distanceText.textContent =
        "移動距離: 0 m";

    // 配列初期化
    path = [];

    // 線削除
    polyline.setLatLngs([]);

    // 前回位置リセット
    previousLat = null;
    previousLng = null;

    // マーカー削除
    if (marker) {

        map.removeLayer(marker);

        marker = null;
    }
});

let gpsVisible = true;

toggleGpsBtn.addEventListener("click", () => {

    gpsVisible = !gpsVisible;

    if (gpsVisible) {

        gpsData.style.display = "block";

        toggleGpsBtn.textContent =
            "GPS情報を隠す";

    } else {

        gpsData.style.display = "none";

        toggleGpsBtn.textContent =
            "GPS情報を表示";
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
async function success(position) {

    const lat = position.coords.latitude;
    let altitude = "取得中...";

    const accuracy = position.coords.accuracy;
    
    const lng = position.coords.longitude;

    // 速度
    let speed = position.coords.speed;

    // 緯度経度
    latitudeText.textContent =
    `緯度: ${lat.toFixed(6)}`;

    longitudeText.textContent =
        `経度: ${lng.toFixed(6)}`;

    try {

        // 国土地理院 標高API
        const url =
            `https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=${lng}&lat=${lat}&outtype=JSON`;
    
        // API通信
        const response = await fetch(url);
    
        // JSONへ変換
        const data = await response.json();
    
        // 標高取得
        altitude = data.elevation;
    
    } catch(error) {

        console.log(error);
    
        altitude = "取得失敗";
    }

    // 高度
   if (typeof altitude === "number") {

        altitudeText.textContent =
            `標高: ${altitude.toFixed(1)} m`;
    
    } else {
    
        altitudeText.textContent =
            `標高: ${altitude}`;
    }
    
    // 精度
    accuracyText.textContent =
        `精度: ${accuracy.toFixed(1)} m`;
    
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
