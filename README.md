# IoTLogger - Installation and Deployment Guide

## 1. Clone Repository

Langkah pertama adalah meng-clone repository **IoTLogger** ke dalam komputer lokal atau server VPS Anda. Untuk melakukannya, buka terminal dan jalankan perintah berikut:

```bash
git clone https://github.com/Gembut/iot-logger-pweb.git
```

## 2. Masuk ke Direktori Proyek

Setelah selesai meng-clone repositori, masuk ke dalam direktori proyek dengan perintah berikut:

```bash
cd PWEBC_IoTLogger
```

## 3. Install Dependencies

Proyek ini menggunakan Node.js dan npm untuk mengelola dependensi. Pastikan Anda sudah menginstall Node.js dan npm di VPS Anda. Jika belum, Anda dapat mengunduhnya di [Node.js Official Website](https://nodejs.org/).

Setelah itu, jalankan perintah berikut untuk menginstall semua dependensi yang diperlukan oleh aplikasi:

```bash
npm install
```

Perintah ini akan mengunduh dan menginstal semua dependensi yang tercantum dalam file `package.json`.

## 4. Menjalankan Aplikasi Secara Lokal di VPS

Setelah semua dependensi terinstall, Anda dapat menjalankan aplikasi dengan perintah berikut:

```bash
npm start
```

Aplikasi akan berjalan di `http://<IP-ADDRESS>:3000` secara default. Anda dapat membuka aplikasi di browser dengan mengunjungi URL tersebut, mengganti `<IP-ADDRESS>` dengan alamat IP VPS Anda.

## 5. Konfigurasi Reverse Proxy dengan Nginx (Opsional)

Untuk mengakses aplikasi melalui domain, Anda dapat mengatur reverse proxy menggunakan Nginx.

### 5.1 Install Nginx

Jalankan perintah berikut untuk menginstall Nginx:

```bash
sudo apt update
sudo apt install nginx
```

### 5.2 Konfigurasi Nginx

Edit file konfigurasi Nginx dengan perintah berikut:

```bash
sudo nano /etc/nginx/sites-available/default
```

Tambahkan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ganti `your-domain.com` dengan nama domain Anda.

### 5.3 Restart Nginx

Simpan file dan keluar, lalu restart Nginx dengan perintah berikut:

```bash
sudo systemctl restart nginx
```

### 5.4 Perbarui Firewall

Jika Anda menggunakan UFW, pastikan untuk mengizinkan HTTP dan HTTPS:

```bash
sudo ufw allow 'Nginx Full'
```

## 6. Menjalankan Aplikasi sebagai Service

Untuk memastikan aplikasi berjalan secara otomatis saat server di-restart, Anda dapat membuat service systemd.

### 6.1 Buat File Service

Buat file service baru:

```bash
sudo nano /etc/systemd/system/iotlogger.service
```

Isi file dengan konfigurasi berikut:

```ini
[Unit]
Description=IoTLogger Service
After=network.target

[Service]
ExecStart=/usr/bin/node /path/to/PWEBC_IoTLogger/src/index.js
Restart=always
User=www-data
Group=www-data
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/path/to/PWEBC_IoTLogger

[Install]
WantedBy=multi-user.target
```

Ganti `/path/to/PWEBC_IoTLogger` dengan path direktori proyek Anda.

### 6.2 Enable dan Start Service

Aktifkan dan mulai service:

```bash
sudo systemctl enable iotlogger
sudo systemctl start iotlogger
```

### 6.3 Periksa Status Service

Periksa apakah service berjalan:

```bash
sudo systemctl status iotlogger
```

## 7. Testing API dengan Postman

File hasil export Postman tersedia dalam repositori ini. Anda dapat menggunakannya untuk menguji API yang disediakan oleh IoTLogger.

### Langkah-langkah:

1. Import file Postman Collection ke dalam aplikasi Postman.
2. Sesuaikan base URL dengan alamat IP atau domain VPS Anda (misalnya, `http://<IP-ADDRESS>:3000`).
3. Gunakan endpoint yang tersedia untuk menguji fitur API, seperti menambah data, mendapatkan data sensor, dan lain-lain.

## 8. Troubleshooting

Jika mengalami masalah:

1. Pastikan semua dependensi sudah terinstall.
2. Periksa kembali konfigurasi database Anda.
3. Periksa log aplikasi dengan perintah berikut:

```bash
sudo journalctl -u iotlogger
```

4. Pastikan Nginx berjalan dengan benar:

```bash
sudo systemctl status nginx
```

5. Jika masih ada masalah, kunjungi bagian **Issues** di repositori GitHub untuk mencari solusi atau membuka issue baru.

Dengan mengikuti langkah-langkah di atas, Anda dapat menginstall, menjalankan, dan mendeply IoTLogger pada VPS Anda dengan konfigurasi yang optimal.

