const express = require("express")
const path = require("path")
const bcrypt  = require("bcrypt")
const {collection, SensorData} = require("./mongodb.js")
const moment = require('moment-timezone');
const port = 3000

const app = express()
app.use(express.json())

app.use(express.urlencoded({extends: false}))

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));


app.use(express.static("public"))

const session = require("express-session");

app.use(session({
    secret: "secretKey",             // Kunci rahasia untuk mengenkripsi sesi
    resave: false,                   // Tidak menyimpan sesi jika tidak ada perubahan
    saveUninitialized: false,        // Tidak membuat sesi kosong
    cookie: { secure: false }        // Atur `true` jika menggunakan HTTPS
}));




app.get("/", (req, res)=>{
    res.render("home")
})


app.get("/login", (req, res)=>{
    res.render("login")
})

app.get("/signup", (req, res)=>{
    res.render("signup")
})

app.post("/add-data", async (req, res) => {
    try {
        // Dapatkan user_email dari sesi
        const userEmail = req.session.user_email; // Ini sudah benar

        if (!userEmail) {
            return res.status(401).send("Anda harus login terlebih dahulu.");
        }

        // Data sensor yang akan ditambahkan
        const newData = new SensorData({
            humidity: req.body.humidity,
            nitrogen: req.body.nitrogen,
            phospor: req.body.phospor,
            kalium: req.body.kalium,
            temperature: req.body.temperature,
            ph: req.body.ph,
            conductivity: req.body.conductivity,
            date: req.body.date,
            user_email: userEmail // Simpan email user dari sesi
        });

        await newData.save();
        res.status(201).send("Data sensor berhasil ditambahkan!");
    } catch (error) {
        console.error("Error adding data:", error);
        res.status(500).send("Error adding data.");
    }
});






app.post("/", async (req, res)=>{
    req.session.destroy((err)=>{
        res.redirect("/")
    });
});



app.post("/post/data", async (req, res) => {
    try {
        let data = req.body;

        // Jika data bukan array, ubah menjadi array
        if (!Array.isArray(data)) {
            data = [data];
        }

        const formatDate = (date) => {
            return moment(date).tz('Asia/Jakarta').format('YYYY-MM-DD, HH:mm:ss');
        };

        // Tambahkan `date` default jika tidak disediakan
        const sensorData = await SensorData.insertMany(
            data.map((item) => ({
                ...item,
                date: item.date || formatDate(new Date())// Isi `date` dengan waktu saat ini jika tidak ada
            }))
        );

        //         const sensorData = await SensorData.insertMany(data);

        res.status(201).json({
            message: "Data berhasil disimpan",
            data: sensorData
        });
    } catch (error) {
        console.error("Error menyimpan data:", error);
        res.status(500).json({
            message: "Gagal menyimpan data",
            error: error.message
        });
    }
});

app.get("/get/user", async (req, res) => {
    try {
        // Cari semua pengguna di koleksi `users`
        const users = await collection.find({}, { name: 1, email: 1, _id: 0 }); // Ambil hanya `name` dan `email`

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Tidak ada pengguna yang ditemukan." }); // Jika tidak ada pengguna
        }

        res.status(200).json({
            message: "Daftar pengguna berhasil ditemukan.",
            users: users, // Kirim daftar pengguna
        });
    } catch (error) {
        console.error("Error fetching users data:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data pengguna.",
            error: error.message,
        });
    }
});

// Endpoint untuk mendapatkan semua data sensor
app.get("/get/data", async (req, res) => {
    try {
        // Ambil semua data dari koleksi `SensorData`
        const allSensorData = await SensorData.find({}, { __v: 0 }); // Hilangkan field `__v` dari hasil query

        if (!allSensorData || allSensorData.length === 0) {
            return res.status(404).json({ message: "Tidak ada data sensor yang ditemukan." }); // Jika tidak ada data
        }

        res.status(200).json({
            message: "Data sensor berhasil ditemukan.",
            data: allSensorData, // Kirim semua data sensor
        });
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data sensor.",
            error: error.message,
        });
    }
});

// Endpoint untuk mendapatkan semua data sensor dari user tertentu
app.get("/get/data/:username", async (req, res) => {
    try {
        const { username } = req.params; // Ambil username dari parameter URL

        // Cari user berdasarkan username
        const user = await collection.findOne({ name: username }, { email: 1, _id: 0 });

        if (!user) {
            return res.status(404).json({ message: `User dengan username '${username}' tidak ditemukan.` });
        }

        // Ambil semua data sensor berdasarkan email user
        const userSensorData = await SensorData.find({ user_email: user.email }, { __v: 0 });

        if (!userSensorData || userSensorData.length === 0) {
            return res.status(404).json({ message: `Tidak ada data sensor untuk user '${username}'.` });
        }

        res.status(200).json({
            message: `Data sensor untuk user '${username}' berhasil ditemukan.`,
            data: userSensorData, // Kirim semua data sensor milik user
        });
    } catch (error) {
        console.error("Error fetching user-specific sensor data:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data sensor user.",
            error: error.message,
        });
    }
});

// Endpoint untuk mendapatkan semua data sensor dari user tertentu dan perangkat spesifik
app.get("/get/data/:username/:deviceId", async (req, res) => {
    try {
        const { username, deviceId } = req.params; // Ambil username dan deviceId dari parameter URL

        // Cari user berdasarkan username
        const user = await collection.findOne({ name: username }, { email: 1, _id: 0 });

        if (!user) {
            return res.status(404).json({ message: `User dengan username '${username}' tidak ditemukan.` });
        }

        // Ambil semua data sensor berdasarkan email user dan deviceId
        const userDeviceData = await SensorData.find({ user_email: user.email, device_id: deviceId }, { __v: 0 });

        if (!userDeviceData || userDeviceData.length === 0) {
            return res.status(404).json({ message: `Tidak ada data sensor untuk user '${username}' dengan perangkat '${deviceId}'.` });
        }

        res.status(200).json({
            message: `Data sensor untuk user '${username}' dengan perangkat '${deviceId}' berhasil ditemukan.`,
            data: userDeviceData, // Kirim semua data sensor milik user untuk deviceId tertentu
        });
    } catch (error) {
        console.error("Error fetching user-specific sensor data for device:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data sensor user untuk perangkat tertentu.",
            error: error.message,
        });
    }
});

app.post("/post/user", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validasi input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
        }

        // Periksa apakah user dengan email atau nama yang sama sudah ada
        const existingUser = await collection.findOne({
            $or: [
                { email: email }, // Cek apakah email sudah ada
                { name: name }    // Cek apakah nama sudah ada
            ]
        });

        if (existingUser) {
            return res.status(409).json({ message: "User dengan email atau nama tersebut sudah terdaftar." });
        }

        // Hash password sebelum disimpan
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Buat user baru
        const newUser = new collection({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save(); // Simpan user ke database

        res.status(201).json({ message: "User berhasil ditambahkan!", user: { name, email } });
    } catch (error) {
        console.error("Error menambahkan user baru:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat menambahkan user baru.",
            error: error.message,
        });
    }
});

app.put("/put/user/:username", async (req, res) => {
    try {
        const { username } = req.params; // Ambil username dari URL parameter
        const { name, email, password } = req.body; // Ambil data yang akan diperbarui dari body

        // Validasi input
        if (!name && !email && !password) {
            return res.status(400).json({ message: "Setidaknya satu field (name, email, password) harus diisi." });
        }

        // Temukan user berdasarkan username
        const user = await collection.findOne({ name: username });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        const oldEmail = user.email; // Simpan email lama untuk pembaruan di koleksi SensorData

        // Perbarui field jika ada dalam body permintaan
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            // Hash password baru jika diperbarui
            const saltRounds = 10;
            user.password = await bcrypt.hash(password, saltRounds);
        }

        // Simpan perubahan user ke database
        await user.save();

        // Jika email diperbarui, perbarui juga email pada data sensor
        if (email) {
            await SensorData.updateMany(
                { user_email: oldEmail }, // Cari semua dokumen dengan email lama
                { $set: { user_email: email } } // Ubah ke email baru
            );
        }

        res.status(200).json({
            message: "User berhasil diperbarui.",
            user: {
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error memperbarui user:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui user.",
            error: error.message,
        });
    }
});


app.delete("/delete/user/:username", async (req, res) => {
    try {
        const { username } = req.params; // Ambil username dari parameter URL

        // Cari pengguna berdasarkan username
        const user = await collection.findOne({ name: username });

        if (!user) {
            return res.status(404).json({ message: `User dengan username '${username}' tidak ditemukan.` });
        }

        // Hapus semua data sensor yang dimiliki user berdasarkan email
        await SensorData.deleteMany({ user_email: user.email });

        // Hapus pengguna dari koleksi `users`
        await collection.deleteOne({ name: username });

        res.status(200).json({
            message: `User '${username}' dan semua data sensornya berhasil dihapus.`,
        });
    } catch (error) {
        console.error("Error menghapus user dan data sensornya:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat menghapus user dan data sensornya.",
            error: error.message,
        });
    }
});






function isAuthenticated(req, res, next) {
    if (req.session && req.session.user_email) {
        return next();
    }
    res.redirect('/login'); // Arahkan ke halaman login jika belum login
}

app.use((req, res, next) => {
    res.locals.user_email = req.session.user_email || null; // Tambahkan user_email ke res.locals
    next();
});


app.get("/data", isAuthenticated, async (req, res) => {
    try {
        const userEmail = req.session.user_email;

        if (!userEmail) {
            return res.status(401).render("data", { message: "Anda harus login terlebih dahulu." });
        }

        // Ambil semua perangkat yang dimiliki user
        const devices = await SensorData.distinct("device_id", { user_email: userEmail });
        
        const sensorData = await SensorData.find({ user_email: userEmail }).sort({ date: -1 });
        const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : {};

        const user = await collection.findOne({ email: userEmail }, { name: 1, _id: 0 });

        res.render("data", { 
            latestData: latestData, 
            sensorData: sensorData,
            devices: devices, // Kirim daftar perangkat
            userName: user.name 
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data.");
    }
});



app.get("/data/json", async (req, res) => {
    try {
        const userEmail = req.session.user_email;
        const sensorData = await SensorData.find({user_email: userEmail}).sort({ date: 1 });
        const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : {};

        res.json({ latestData, sensorData });
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        res.status(500).json({ error: "Error fetching sensor data" });
    }
});

app.get('/userDevices', async (req, res) => {
    const user_email = req.session.user_email;

    try {
        // Gunakan `distinct` untuk memastikan perangkat unik
        const devices = await SensorData.distinct("device_id", { user_email });
        res.json(devices);
    } catch (err) {
        console.error("Error fetching devices:", err);
        res.status(500).json({ error: "Error fetching devices" });
    }
});




app.get("/getDeviceData", isAuthenticated, async (req, res) => {
    const { device_id } = req.query; // Ambil device_id dari query parameter
    const userEmail = req.session.user_email;

    try {
        // Ambil data berdasarkan device_id dan user_email
        const deviceData = await SensorData.find({ device_id, user_email: userEmail }).sort({ date: -1 });

        if (!deviceData.length) {
            return res.status(404).json({ message: "Data tidak ditemukan untuk perangkat ini." });
        }

        const latestData = deviceData[0]; // Data terkini (data pertama setelah disortir descending)
        res.json({ latestData, sensorData: deviceData });
    } catch (error) {
        console.error("Error fetching device data:", error);
        res.status(500).json({ error: "Error fetching device data." });
    }
});


  

app.post("/selectDevice", isAuthenticated, async (req, res) => {
    const { device } = req.body;
    const userEmail = req.session.user_email;

    try {
        // Validasi apakah perangkat milik user
        const isUserDevice = await SensorData.findOne({ device_id: device, user_email: userEmail });

        if (!isUserDevice) {
            return res.status(403).send("Anda tidak memiliki perangkat ini.");
        }

        res.send(`Perangkat ${device} telah dipilih!`);
    } catch (error) {
        console.error("Error selecting device:", error);
        res.status(500).send("Error selecting device.");
    }
});





app.post("/signup", async (req, res)=>{
    const data = {
        name : req.body.name,
        email: req.body.email,
        password: req.body.password
    }

    // const existingUser = await collection.findOne({email: data.email})
    const existingUser = await collection.findOne({
        $or: [
            { email: data.email }, // Cek apakah email sudah ada
            { name: data.name }    // Cek apakah nama sudah ada
        ]
    })
    if(existingUser){
        res.render("signup", {message:"Email atau username sudah terdaftar."})
    }
    else{
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(data.password, saltRounds)

        data.password = hashedPassword

        const userdata = await collection.insertMany(data)
        res.redirect("/login"); // Arahkan ke halaman login
        console.log("user berhasil masuk db")
    }
})


app.post("/login", async (req, res) => {
    try {
        const user = await collection.findOne({ email: req.body.email });

        if (!user) {
            return res.render("login", { message: "Email tidak ditemukan." });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordMatch) {
            // Simpan email user ke sesi
            req.session.user_email = user.email;

            console.log("User email disimpan di sesi:", req.session.user_email);
            res.redirect("/data"); // Arahkan ke halaman data
        } else {
            res.render("login", { message: "Password salah." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).render("login", {message: "Terjadi kesalahan saat login."});
    }
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log(`Server is running`)
})

