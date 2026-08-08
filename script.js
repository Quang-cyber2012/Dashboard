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
async function getData() {
    console.log("Fetching data...");
    try {
        const res =
            await fetch("http://100.93.190.4:5000/RevData");
        const data =
            await res.json();
            console.log(data);
        document.getElementById("status")
            .className =
            "status connected";
        document.getElementById("statusText")
            .innerHTML =
            "Connected";
        updateData(data);
    }
    catch (error) {
        console.log(error);
        document.getElementById("status")
            .className =
            "status disconnected";

        document.getElementById("statusText")
            .innerHTML =
            "Disconnected";
    }
}
getData();
setInterval(
    getData,
    500
);