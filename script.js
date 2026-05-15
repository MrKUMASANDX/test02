const map = L.map('map').setView([35.681236, 139.767125], 13);

// 地図表示
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker;

// 移動経路を保存
let path = [];

// 線
let polyline = L.polyline(path, {
    color: 'blue',
    weight: 5
}).addTo(map);

// 現在地追跡
navigator.geolocation.watchPosition(
    success,
    error,
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    }
);

// 成功時
function success(position) {

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    console.log(lat, lng);

    // 地図移動
    map.setView([lat, lng], 17);

    // 配列へ追加
    path.push([lat, lng]);

    // 線更新
    polyline.setLatLngs(path);

    // 最初だけ作成
    if (!marker) {

        marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup("現在地")
            .openPopup();

    } else {

        // マーカー移動
        marker.setLatLng([lat, lng]);
    }
}

// エラー
function error(err) {

    console.log(err);

    switch(err.code) {

        case 1:
            alert("位置情報が許可されていません");
            break;

        case 2:
            alert("位置情報を取得できません");
            break;

        case 3:
            alert("タイムアウトしました");
            break;

        default:
            alert("不明なエラー");
            break;
    }
}
