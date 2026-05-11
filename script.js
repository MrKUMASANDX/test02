const map = L.map('map').setView([35.681236, 139.767125], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker;

// リアルタイム追跡
navigator.geolocation.watchPosition(

    position => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // 初回だけマーカー作成
        if (!marker) {

            marker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup("現在地");

        } else {

            // マーカー移動
            marker.setLatLng([lat, lng]);
        }

        // 地図移動
        map.setView([lat, lng], 16);

        console.log(lat, lng);
    },

    err => {
        console.log(err);
    },

    {
        enableHighAccuracy: true
    }
);
