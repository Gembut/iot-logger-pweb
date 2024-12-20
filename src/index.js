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



app.post("/post", async (req, res) => {
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