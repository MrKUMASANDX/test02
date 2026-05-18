// =====================
// 地図初期化
// =====================

const map = L.map('map').setView([37.95, 139.33], 13);


// =====================
// 通常マップ
// =====================

const normalMap = L.tileLayer(

    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    {
        attribution: '&copy; OpenStreetMap contributors'
    }
);


// =====================
// 避難用地形マップ
// =====================

const evacuationMap = L.tileLayer(

    'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',

    {
        attribution: '国土地理院'
    }
);


// =====================
// 洪水ハザードマップ
// =====================

const floodMap = L.tileLayer(

    'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',

    {
        attribution: '国土地理院 洪水浸水想定'
    }
);


// 初期表示
normalMap.addTo(map);


// =====================
// HTML取得
// =====================

const speedText =
    document.getElementById("speed");

const distanceText =
    document.getElementById("distance");

const followBtn =
    document.getElementById("followBtn");

const resetBtn =
    document.getElementById("resetBtn");

const toggleGpsBtn =
    document.getElementById("toggleGpsBtn");

const evacuationBtn =
    document.getElementById("evacuationBtn");

const normalMapBtn =
    document.getElementById("normalMapBtn");

const reliefMapBtn =
    document.getElementById("reliefMapBtn");

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

const safeDirectionText =
    document.getElementById("safeDirection");

const dangerWarningText =
    document.getElementById("dangerWarning");

const nearestShelterText =
    document.getElementById("nearestShelter");


// =====================
// 現在地アイコン
// =====================

const gpsIcon = L.icon({

    iconUrl: 'location.png',

    iconSize: [40, 40],

    iconAnchor: [20, 20]
});


// =====================
// 避難所データ
// =====================

const shelters = [

    {
        name: "新発田市カルチャーセンター",
        lat: 37.9495,
        lng: 139.3270
    },

    {
        name: "加治川地区公民館",
        lat: 37.8460,
        lng: 139.2920
    },

    {
        name: "紫雲寺地区公民館",
        lat: 37.8890,
        lng: 139.2600
    },

    {
        name: "豊浦地区公民館",
        lat: 37.9600,
        lng: 139.2450
    },

    {
        name: "川東コミュニティセンター",
        lat: 37.9130,
        lng: 139.3800
    }
];

let shelterMarkers = [];


// =====================
// 状態管理
// =====================

let followMode = true;

let gpsVisible = true;

let evacuationMode = false;

let marker;

let path = [];

let totalDistance = 0;

let previousLat = null;
let previousLng = null;


// =====================
// 移動経路
// =====================

let polyline = L.polyline(path, {

    color: 'blue',

    weight: 5

}).addTo(map);


// =====================
// 追従切替
// =====================

followBtn.addEventListener("click", () => {

    followMode = !followMode;

    if (followMode) {

        followBtn.textContent =
            "追従: ON";

    } else {

        followBtn.textContent =
            "追従: OFF";
    }
});


// =====================
// リセット
// =====================

resetBtn.addEventListener("click", () => {

    if (!confirm("リセットしますか？")) {
        return;
    }

    totalDistance = 0;

    distanceText.textContent =
        "移動距離: 0 m";

    path = [];

    polyline.setLatLngs([]);

    previousLat = null;
    previousLng = null;

    if (marker) {

        map.removeLayer(marker);

        marker = null;
    }
});


// =====================
// GPS表示切替
// =====================

toggleGpsBtn.addEventListener("click", () => {

    gpsVisible = !gpsVisible;

    if (gpsVisible) {

        gpsData.style.display =
            "block";

        toggleGpsBtn.textContent =
            "GPS情報を隠す";

    } else {

        gpsData.style.display =
            "none";

        toggleGpsBtn.textContent =
            "GPS情報を表示";
    }
});


// =====================
// 避難モード切替
// =====================

evacuationBtn.addEventListener("click", () => {

    evacuationMode = !evacuationMode;

    if (evacuationMode) {

        floodMap.addTo(map);

        evacuationBtn.textContent =
            "避難モード: ON";

        // 避難所表示
        shelters.forEach((shelter) => {

            const shelterMarker = L.marker(

                [shelter.lat, shelter.lng]

            )

            .addTo(map)

            .bindPopup(shelter.name);

            shelterMarkers.push(
                shelterMarker
            );
        });

    } else {

            if (map.hasLayer(floodMap)) {
        
                map.removeLayer(floodMap);
            }


        evacuationBtn.textContent =
            "避難モード: OFF";

        shelterMarkers.forEach((marker) => {

            map.removeLayer(marker);
        });

        shelterMarkers = [];
    }
});

// =====================
// 通常地図ボタン
// =====================

normalMapBtn.addEventListener("click", () => {

    // 地形図が表示中なら消す
    if (map.hasLayer(evacuationMap)) {

        map.removeLayer(evacuationMap);
    }

    // 通常地図が未表示なら追加
    if (!map.hasLayer(normalMap)) {

        normalMap.addTo(map);
    }
});


// =====================
// 地形図ボタン
// =====================

reliefMapBtn.addEventListener("click", () => {

    // 通常地図が表示中なら消す
    if (map.hasLayer(normalMap)) {

        map.removeLayer(normalMap);
    }

    // 地形図が未表示なら追加
    if (!map.hasLayer(evacuationMap)) {

        evacuationMap.addTo(map);
    }
});

// =====================
// GPS追跡
// =====================

navigator.geolocation.watchPosition(

    success,

    error,

    {

        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0
    }
);


// =====================
// GPS成功
// =====================

async function success(position) {

    const lat =
        position.coords.latitude;

    const lng =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;

    // 速度
    let speed =
        position.coords.speed;

    if (speed === null) {

        speed = 0;
    }

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

    // 距離表示
    if (totalDistance < 1000) {

        distanceText.textContent =

            `移動距離: ${totalDistance.toFixed(1)} m`;

    } else {

        distanceText.textContent =

            `移動距離: ${(totalDistance / 1000).toFixed(2)} km`;
    }

    // 国土地理院 標高API
    let altitude = "取得失敗";

    try {

        const url =

            `https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=${lng}&lat=${lat}&outtype=JSON`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        altitude =
            data.elevation;

    } catch(error) {

        console.log(error);
    }

    // GPS情報表示
    latitudeText.textContent =
        `緯度: ${lat.toFixed(6)}`;

    longitudeText.textContent =
        `経度: ${lng.toFixed(6)}`;

    if (
        typeof altitude === "number"
    ) {

        altitudeText.textContent =
            `標高: ${altitude.toFixed(1)} m`;

    } else {

        altitudeText.textContent =
            `標高: ${altitude}`;
    }

    accuracyText.textContent =
        `精度: ${accuracy.toFixed(1)} m`;

    // 危険警告
    if (
        typeof altitude === "number" &&
        altitude < 5
    ) {

        dangerWarningText.textContent =
            "警告: 標高が低いです";

    } else {

        dangerWarningText.textContent =
            "警告: なし";
    }

    // 高台方向（簡易版）
    safeDirectionText.textContent =
        "高台方向: 北西";

    // 最寄り避難所
    let nearestShelter = null;

    let minDistance = Infinity;

    shelters.forEach((shelter) => {

        const distance = getDistance(

            lat,
            lng,

            shelter.lat,
            shelter.lng
        );

        if (distance < minDistance) {

            minDistance = distance;

            nearestShelter = shelter;
        }
    });

    if (nearestShelter) {

        let shelterDistance;

        if (minDistance < 1000) {

            shelterDistance =
                `${minDistance.toFixed(0)} m`;

        } else {

            shelterDistance =
                `${(minDistance / 1000).toFixed(2)} km`;
        }

        nearestShelterText.textContent =

            `最寄り避難所:
${nearestShelter.name}

距離:
${shelterDistance}`;
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


// =====================
// GPSエラー
// =====================

function error(err) {

    console.log(err);

    alert(
        "位置情報を取得できません"
    );
}


// =====================
// 距離計算
// =====================

function getDistance(

    lat1,
    lng1,

    lat2,
    lng2

) {

    const R = 6371000;

    const dLat =

        (lat2 - lat1)

        * Math.PI / 180;

    const dLng =

        (lng2 - lng1)

        * Math.PI / 180;

    const a =

        Math.sin(dLat / 2)
        *
        Math.sin(dLat / 2)

        +

        Math.cos(lat1 * Math.PI / 180)

        *

        Math.cos(lat2 * Math.PI / 180)

        *

        Math.sin(dLng / 2)

        *

        Math.sin(dLng / 2);

    const c =

        2 * Math.atan2(

            Math.sqrt(a),

            Math.sqrt(1 - a)
        );

    return R * c;
}
