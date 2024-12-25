# IoTLogger - Installation and Deployment Guide
 
## 1. Clone Repository

Langkah pertama adalah meng-clone repository **IoTLogger** ke dalam komputer lokal Anda. Untuk melakukannya, buka terminal dan jalankan perintah berikut:

bash
git clone `https://github.com/Gembut/iot-logger-pweb.git`
2. Masuk ke Direktori Proyek
Setelah selesai meng-clone repositori, masuk ke dalam direktori proyek dengan perintah berikut:

bash
Copy code
cd PWEBC_IoTLogger
3. Install Dependencies
Proyek ini menggunakan Node.js dan npm untuk mengelola dependensi, serta EJS sebagai template engine. Pastikan Anda sudah menginstall Node.js dan npm di komputer Anda. Jika belum, Anda dapat mengunduhnya di Node.js Official Website.

Setelah itu, jalankan perintah berikut untuk menginstall semua dependensi yang diperlukan oleh aplikasi:

bash
Copy code
npm install
Perintah ini akan mengunduh dan menginstal semua dependensi yang tercantum dalam file package.json, termasuk EJS sebagai template engine.

4. Struktur Proyek dan Penggunaan EJS
Proyek ini menggunakan EJS sebagai template engine untuk rendering halaman HTML. File EJS biasanya terletak di dalam folder views di dalam proyek Anda.

Jika Anda ingin menambahkan atau mengubah tampilan, Anda bisa memodifikasi file-file yang ada di dalam folder views sesuai kebutuhan.

5. Menjalankan Aplikasi Secara Lokal
Setelah semua dependensi terinstall, Anda dapat menjalankan aplikasi dengan perintah berikut:

bash
Copy code
npm start
Aplikasi akan berjalan di http://localhost:3000 secara default. Anda dapat membuka aplikasi di browser dengan mengunjungi URL tersebut.

6. Deploy ke OnRender
Setelah berhasil menjalankan aplikasi secara lokal, Anda dapat mendeply aplikasi ke OnRender. Ikuti langkah-langkah berikut untuk mendeply aplikasi Anda ke OnRender.

6.1 Buat Akun di OnRender
Jika Anda belum memiliki akun di OnRender, Anda bisa mendaftar di OnRender.com.

6.2 Buat New Web Service di OnRender
Setelah login ke akun OnRender, pilih New Web Service.
Pilih Deploy from GitHub.
Hubungkan akun GitHub Anda dengan OnRender jika belum terhubung.
Pilih repositori yang ingin Anda deploy, dalam hal ini PWEBC_IoTLogger.
6.3 Konfigurasi Deployment
Build Command: Anda bisa menggunakan perintah npm install untuk menginstall dependensi, atau biarkan OnRender mendeteksi perintah otomatis.
Start Command: Gunakan perintah berikut untuk menjalankan aplikasi:
bash
Copy code
npm start
6.4 Pilih Region dan Deploy
Pilih region terdekat dengan lokasi server Anda untuk mengoptimalkan performa.
Klik tombol Create Web Service untuk memulai proses deploy.
6.5 Akses Aplikasi yang Sudah Dideploy
Setelah proses deploy selesai, OnRender akan memberikan URL untuk aplikasi Anda. Anda dapat mengakses aplikasi yang sudah dideploy melalui URL tersebut.

7. Konfigurasi (Jika Diperlukan)
Pastikan untuk memeriksa dan menyesuaikan pengaturan di file konfigurasi yang diperlukan (misalnya, .env atau file konfigurasi lainnya). Pada saat deploy ke OnRender, Anda dapat menambahkan variabel lingkungan di dashboard OnRender di bagian Environment Variables jika diperlukan.

8. Mengatasi Masalah
Jika Anda mengalami masalah saat menjalankan aplikasi, Anda dapat memeriksa bagian Issues di repositori GitHub ini untuk mencari solusi yang relevan atau membuka Issue baru untuk mendapatkan bantuan lebih lanjut.

Dengan mengikuti langkah-langkah di atas, Anda akan dapat menginstall, menjalankan, dan mendeply IoTLogger pada komputer lokal Anda serta di OnRender.
