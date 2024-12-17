let sensorChart; // Variabel untuk menyimpan instance Chart.js
const ctx = document.getElementById("sensorChart").getContext("2d");


async function fetchData() {
    try {
        const response = await fetch('/data/json'); // Ambil data JSON dari server
        const data = await response.json();

        const latestData = data.latestData; // Data terkini
        const sensorData = data.sensorData; // Seluruh data sensor

        // Fungsi untuk mengecek range
        const checkRange = (value, min, max) => value < min || value > max;

        // Fungsi untuk memperbarui card dengan satuan dan pengecekan range
        const updateCard = (elementId, value, min, max, unit) => {
            const cardElement = document.getElementById(elementId);
            cardElement.querySelector('p').innerText = value !== undefined ? `${value} ${unit}` : "N/A";
            cardElement.style.backgroundColor = checkRange(value, min, max) ? "#FFD700" : "#262626"; // Default warna card
        };

        // Update setiap card dengan satuan yang sesuai
        updateCard("humidityCard", latestData.humidity, 30, 50, "%"); // Kelembapan (30-50%)
        updateCard("nitrogenCard", latestData.nitrogen, 3, 10, "mg/L"); // Nitrogen
        updateCard("phosporCard", latestData.phospor, 10, 20, "mg/L"); // Phospor
        updateCard("kaliumCard", latestData.kalium, 30, 40, "mg/L"); // Kalium
        updateCard("temperatureCard", latestData.temperature, 20, 35, "°C"); // Suhu
        updateCard("phCard", latestData.ph, 6, 8, ""); // pH (tidak butuh satuan tambahan)
        updateCard("conductivityCard", latestData.conductivity, 1, 5, "ds/m"); // Konduktivitas

        // Update grafik jika sudah ada
        const dates = sensorData.map(data => data.date);
        const selectedData = sensorData.map(data => data[document.getElementById("graphSelect").value]);

        if (sensorChart) {
            sensorChart.data.labels = dates;
            sensorChart.data.datasets[0].data = selectedData;
            sensorChart.update(); // Update grafik
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}



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



// Render grafik pertama kali (default ke humidity)
renderChart("humidity", "Kelembapan", "blue");

// Jalankan fetchData pertama kali dan setiap 1 detik
setInterval(fetchData, 1000);
