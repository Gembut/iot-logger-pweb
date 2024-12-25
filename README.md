# IoTLogger - Installation and Deployment Guide

## 1. Clone Repository

Langkah pertama adalah meng-clone repository **IoTLogger** ke dalam komputer lokal Anda. Untuk melakukannya, buka terminal dan jalankan perintah berikut:

```bash
git clone https://github.com/Gembut/iot-logger-pweb.git
```

## 2. Masuk ke Direktori Proyek

Setelah selesai meng-clone repositori, masuk ke dalam direktori proyek dengan perintah berikut:

```bash
cd iot-logger-pweb
```

## 3. Install Dependencies

Proyek ini menggunakan Node.js dan npm untuk mengelola dependensi. Pastikan Anda sudah menginstall Node.js dan npm di komputer Anda. Jika belum, Anda dapat mengunduhnya di [Node.js Official Website](https://nodejs.org/).

Setelah itu, jalankan perintah berikut untuk menginstall semua dependensi yang diperlukan oleh aplikasi:

```bash
npm install
```

Perintah ini akan mengunduh dan menginstal semua dependensi yang tercantum dalam file `package.json`.

## 4. Menjalankan Aplikasi Secara Lokal

Setelah semua dependensi terinstall, Anda dapat menjalankan aplikasi dengan perintah berikut:

```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000` secara default. Anda dapat membuka aplikasi di browser dengan mengunjungi URL tersebut.

## 5. Struktur Proyek

- **`src/index.js`**: Berisi logika utama aplikasi.
- **`views/`**: Folder yang berisi file template EJS untuk rendering halaman.
- **`public/`**: Folder untuk menyimpan file static seperti CSS, JavaScript, dan gambar.

## 6. Deploy ke OnRender

### 6.1 Buat Akun di OnRender

Jika Anda belum memiliki akun di OnRender, daftar di [OnRender](https://render.com).

### 6.2 Buat New Web Service di OnRender

1. Login ke akun OnRender.
2. Pilih **New Web Service**.
3. Pilih **Deploy from GitHub**.
4. Hubungkan akun GitHub Anda dengan OnRender jika belum terhubung.
5. Pilih repositori "iot-logger-pweb".

### 6.3 Konfigurasi Deployment

- **Build Command**: Biarkan kosong (Render akan mendeteksi otomatis).
- **Start Command**: Gunakan perintah berikut untuk menjalankan aplikasi:

```bash
npm start
```

### 6.4 Pilih Region dan Deploy

1. Pilih region terdekat untuk performa optimal.
2. Klik tombol **Create Web Service** untuk memulai proses deploy.

### 6.5 Akses Aplikasi yang Sudah Dideploy

Setelah proses deploy selesai, OnRender akan memberikan URL untuk aplikasi Anda. Anda dapat mengakses aplikasi melalui URL tersebut.


## 7. Menggunakan Postman untuk Menguji API

File hasil export Postman tersedia di dalam repositori GitHub. Anda dapat menggunakannya untuk menguji endpoint API yang ada. Berikut adalah langkah-langkahnya:

1. **Download dan Install Postman**
   - Jika Anda belum memiliki Postman, unduh dari [Postman Official Website](https://www.postman.com/downloads/).

2. **Import Collection Postman**
   - Buka Postman dan pilih menu **Import**.
   - Pilih file export Postman yang tersedia di dalam repositori (`postman-iot-logger.json`).

3. **Gunakan Collection untuk Menguji API**
   - Setelah di-import, Anda akan melihat daftar endpoint yang sudah dikonfigurasi.
   - Sesuaikan variabel lingkungan (base URL, token, atau lainnya) sesuai dengan aplikasi Anda.
   - Klik salah satu endpoint, sesuaikan parameter jika diperlukan, lalu tekan tombol **Send** untuk mengirimkan permintaan ke server.

## 8. Troubleshooting

Jika mengalami masalah:

1. Pastikan semua dependensi sudah terinstall.
2. Periksa kembali konfigurasi database Anda.
3. Periksa log aplikasi di terminal atau dashboard OnRender.
4. Kunjungi bagian **Issues** di repositori GitHub untuk mencari solusi atau membuka issue baru.

## 9. Teknologi yang Digunakan

- **Node.js**: Untuk server-side scripting.
- **Express.js**: Framework untuk membangun server.
- **MongoDB**: Database untuk menyimpan data IoT.
- **EJS**: Template engine untuk rendering halaman HTML.
- **Chart.js**: Library untuk menampilkan grafik data sensor.

Dengan mengikuti langkah-langkah di atas, Anda dapat menginstall, menjalankan, mendeply, serta menguji IoTLogger pada komputer lokal Anda atau di OnRender.
