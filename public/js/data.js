let sensorChart; // Variabel untuk menyimpan instance Chart.js
const ctx = document.getElementById("sensorChart").getContext("2d");


async function fetchData() {
    try {
        const selectedDevice = document.getElementById("deviceSelect").value; // Ambil perangkat yang dipilih
        if (!selectedDevice) return; // Jika tidak ada perangkat yang dipilih, hentikan

        // Fetch data dari server berdasarkan perangkat yang dipilih
        const response = await fetch(`/getDeviceData?device_id=${selectedDevice}`);
        const { latestData, sensorData } = await response.json();

        // Fungsi untuk mengecek range
        const checkRange = (value, min, max) => value < min || value > max;

        // Fungsi untuk memperbarui card dengan satuan dan pengecekan range
        const updateCard = (elementId, value, min, max, unit) => {
            const cardElement = document.getElementById(elementId);
            cardElement.querySelector('p').innerText = value !== undefined ? `${value} ${unit}` : "N/A";
            cardElement.style.backgroundColor = checkRange(value, min, max) ? "#FFD700" : "#262626"; // Default warna card
        };

        // Update setiap card dengan satuan yang sesuai
        updateCard("humidityCard", latestData.humidity, 30, 50, "%");
        updateCard("nitrogenCard", latestData.nitrogen, 3, 10, "mg/L");
        updateCard("phosporCard", latestData.phospor, 10, 20, "mg/L");
        updateCard("kaliumCard", latestData.kalium, 30, 40, "mg/L");
        updateCard("temperatureCard", latestData.temperature, 20, 35, "°C");
        updateCard("phCard", latestData.ph, 6, 8, "");
        updateCard("conductivityCard", latestData.conductivity, 1, 5, "ds/m");

        // Update grafik jika sudah ada
        const dates = sensorData.map(data => data.date);
        const parameter = document.getElementById("graphSelect").value;
        const selectedData = sensorData.map(data => data[parameter]);

        if (sensorChart) {
            sensorChart.data.labels = dates;
            sensorChart.data.datasets[0].data = selectedData;
            sensorChart.update(); // Update grafik
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetch(`/userDevices`)
    .then(response => response.json())
    .then(devices => {
        const deviceSelect = document.getElementById("deviceSelect");

        // Kosongkan dropdown sebelum menambahkan opsi baru
        deviceSelect.innerHTML = '';

        // Isi dropdown dengan daftar perangkat
        devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device;
            option.textContent = device;
            deviceSelect.appendChild(option);
        });

        // Pilih perangkat pertama secara default dan perbarui data
        if (devices.length > 0) {
            deviceSelect.value = devices[0];
            fetchData(devices[0]); // Fetch data untuk perangkat pertama
        }
    })
    .catch(error => {
        console.error("Error fetching devices:", error);
    });





// Fungsi untuk menggambar grafik awal
function renderChart(parameter, label, color) {
    const sensorData = JSON.parse(document.getElementById("sensorData").textContent);
    const dates = sensorData.map(data => data.date);
    const selectedData = sensorData.map(data => data[parameter]);

    if (sensorChart) {
        sensorChart.destroy();
    }

    sensorChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: label,
                data: selectedData,
                borderColor: color,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Grafik ${label}`
                }
            },
            scales: {
                x: { title: { display: true, text: "Tanggal" } },
                y: { title: { display: true, text: "Nilai" } }
            }
        }
    });
}

// Event listener untuk dropdown
document.getElementById("graphSelect").addEventListener("change", (e) => {
    const value = e.target.value;

    // Tentukan parameter grafik berdasarkan pilihan dropdown
    switch (value) {
        case "humidity":
            renderChart("humidity", "Kelembapan", "blue");
            break;
        case "nitrogen":
            renderChart("nitrogen", "Nitrogen", "green");
            break;
        case "phospor":
            renderChart("phospor", "Phospor", "orange");
            break;
        case "kalium":
            renderChart("kalium", "Kalium", "purple");
            break;
        case "temperature":
            renderChart("temperature", "Suhu", "red");
            break;
        case "ph":
            renderChart("ph", "pH", "brown");
            break;
        case "conductivity":
            renderChart("conductivity", "Konduktivitas", "gray");
            break;
        default:
            break;
    }
});

async function updateDeviceData(deviceId) {
    try {
        const response = await fetch(`/getDeviceData?device_id=${deviceId}`);
        const { latestData, sensorData } = await response.json();

        // Update data terkini pada kartu
        const updateCard = (elementId, value, min, max, unit) => {
            const cardElement = document.getElementById(elementId);
            cardElement.querySelector('p').innerText = value !== undefined ? `${value} ${unit}` : "N/A";
            cardElement.style.backgroundColor = value < min || value > max ? "#FFD700" : "#262626"; // Highlight jika di luar range
        };

        updateCard("humidityCard", latestData.humidity, 30, 50, "%");
        updateCard("nitrogenCard", latestData.nitrogen, 3, 10, "mg/L");
        updateCard("phosporCard", latestData.phospor, 10, 20, "mg/L");
        updateCard("kaliumCard", latestData.kalium, 30, 40, "mg/L");
        updateCard("temperatureCard", latestData.temperature, 20, 35, "°C");
        updateCard("phCard", latestData.ph, 6, 8, "");
        updateCard("conductivityCard", latestData.conductivity, 1, 5, "ds/m");

        // Update grafik dengan data baru
        const dates = sensorData.map(data => data.date);
        const parameter = document.getElementById("graphSelect").value;
        const selectedData = sensorData.map(data => data[parameter]);

        if (sensorChart) {
            sensorChart.data.labels = dates;
            sensorChart.data.datasets[0].data = selectedData;
            sensorChart.update();
        }
    } catch (error) {
        console.error("Error updating device data:", error);
    }
}

// Jalankan update saat dropdown perangkat berubah
document.getElementById("deviceSelect").addEventListener("change", (e) => {
    const selectedDevice = e.target.value;
    if (selectedDevice) {
        updateDeviceData(selectedDevice); // Perbarui data
    }
});

// Jalankan update saat dropdown grafik berubah
document.getElementById("graphSelect").addEventListener("change", () => {
    const selectedDevice = document.getElementById("deviceSelect").value;
    if (selectedDevice) {
        updateDeviceData(selectedDevice); // Perbarui data
    }
});


// Jalankan update pertama kali berdasarkan perangkat pertama dalam dropdown
const initialDevice = document.getElementById("deviceSelect").value;
if (initialDevice) {
    updateDeviceData(initialDevice);
}


// Event listener untuk dropdown perangkat
document.getElementById("deviceSelect").addEventListener("change", () => {
    const selectedDevice = document.getElementById("deviceSelect").value;
    if (selectedDevice) {
        fetchData(selectedDevice); // Perbarui data saat perangkat dipilih
    }
});


document.getElementById("graphSelect").addEventListener("change", (e) => {
    const value = e.target.value;
    const selectedDevice = document.getElementById("deviceSelect").value; // Ambil perangkat terpilih

    if (selectedDevice) {
        updateDeviceData(selectedDevice); // Perbarui data dengan parameter baru
    }
});




// // Jalankan update pertama kali berdasarkan perangkat pertama dalam dropdown
// const initialDevice = document.getElementById("deviceSelect").value;
// if (initialDevice) {
//     updateDeviceData(initialDevice);
// }






// Render grafik pertama kali (default ke humidity)
renderChart("humidity", "Kelembapan", "blue");

// Jalankan fetchData pertama kali dan setiap 1 detik
// Jalankan fetchData setiap detik untuk perangkat yang dipilih
setInterval(() => {
    const selectedDevice = document.getElementById("deviceSelect").value;
    if (selectedDevice) {
        fetchData();
    }
}, 1000);
