var map = L.map("map")
    .setView([10.772, 106.698], 18);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        minZoom: 1
    }
).addTo(map);
const blueIcon = L.icon({
    iconUrl: "blue.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});
const redIcon = L.icon({
    iconUrl: "red.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});
const vehicleMarker = L.marker(
    [10.772, 106.698],
    {
        icon: blueIcon
    }
).addTo(map);
let currentLine = null;
let currentState = null;
let lastLat = null;
let lastLon = null;
function newLine(isClosed){
    currentLine = L.polyline(
        [],
        {
            color: isClosed ? "red" : "blue",
            weight: 5
        }
    ).addTo(map);
    currentState = isClosed;
}
var panel =
    document.getElementById("panel");
document.querySelector(".dialog").onclick = function () {
    panel.classList.toggle("show");
};
function updateData(data) {
    document.getElementById("speed").innerHTML =
        data.speed ?? "null";
    document.getElementById("gyro").innerHTML =
        data.gyro ?? "null";
    document.getElementById("roll").innerHTML =
        data.roll ?? "null";
    document.getElementById("pitch").innerHTML =
        data.pitch ?? "null";
    document.getElementById("lat").innerHTML =
        data.lat ?? "null";
    document.getElementById("lon").innerHTML =
        data.lon ?? "null";
    if (data.is_closed === true) {
        document.getElementById("closed").innerHTML =
            "Closed";
    }
    else if (data.is_closed === false) {
        document.getElementById("closed").innerHTML =
            "Open";
    }
    else {
        document.getElementById("closed").innerHTML =
            "null";
    }
    if (
        data.lat != null &&
        data.lon != null
    ) {
        vehicleMarker.setLatLng([
            data.lat,
            data.lon
        ]);
        if (data.is_closed) {
            vehicleMarker.setIcon(redIcon);
        }
        else {
            vehicleMarker.setIcon(blueIcon);
        }
        if (currentLine == null) {
            newLine(data.is_closed);
        }
        else if (currentState !== data.is_closed) {
            newLine(data.is_closed);
            if (lastLat != null) {
                currentLine.addLatLng([
                    lastLat,
                    lastLon
                ]);
            }
        }
        if (
            lastLat !== data.lat ||
            lastLon !== data.lon
        ) {
            currentLine.addLatLng([
                data.lat,
                data.lon
            ]);
            map.panTo([
                data.lat,
                data.lon
            ]);
            lastLat = data.lat;
            lastLon = data.lon;
        }
    }
}
const socket = io("http://192.168.1.23:5000");

socket.on("connect", () => {
    console.log("WebSocket connected");

    document.getElementById("status").className =
        "status connected";

    document.getElementById("statusText").innerHTML =
        "Connected";
});

socket.on("data", (data) => {
    console.log("Received:", data);

    updateData(data);
});

socket.on("disconnect", () => {
    console.log("WebSocket disconnected");

    document.getElementById("status").className =
        "status disconnected";

    document.getElementById("statusText").innerHTML =
        "Disconnected";
});

socket.on("connect_error", (error) => {
    console.log("Connection error:", error);

    document.getElementById("status").className =
        "status disconnected";

    document.getElementById("statusText").innerHTML =
        "Disconnected";
});