// 初期マップ
const map = L.map('map').setView([35.681236, 139.767125], 13);

// OpenStreetMap を表示
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ボタン
const button = document.getElementById("getLocationBtn");

button.addEventListener("click", () => {

    // ブラウザが位置情報に対応しているか確認
    if (!navigator.geolocation) {
        alert("位置情報に対応していません");
        return;
    }

    // 現在地取得
    navigator.geolocation.getCurrentPosition(
        success,
        error
    );
});

// 成功時
function success(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // 地図を現在地へ移動
    map.setView([latitude, longitude], 15);

    // マーカー追加
    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("現在地")
        .openPopup();

    console.log("緯度:", latitude);
    console.log("経度:", longitude);
}

// 失敗時
function error() {
    alert("現在地を取得できませんでした");
}