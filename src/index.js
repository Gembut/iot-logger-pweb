const express = require("express")
const path = require("path")
const bcrypt  = require("bcrypt")
const {collection, SensorData} = require("./mongodb.js")
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

        // Simpan data ke MongoDB menggunakan insertMany
        const sensorData = await SensorData.insertMany(data);

        // Kirim respons berhasil
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




app.get("/data", async (req, res) => {
    try {
        const userEmail = req.session.user_email; // Ambil email dari sesi

        if (!userEmail) {
            return res.status(401).render("data", {message:"Anda harus login terlebih dahulu."});
        }

        console.log("Fetching data for email:", userEmail); // Debug log email

        // Ambil data sensor berdasarkan email user
        const sensorData = await SensorData.find({user_email: userEmail}).sort({ date: 1 });
        console.log("Fetched sensor data:", sensorData);

        const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : {};

        console.log("Latest data:", latestData);
        console.log("Sensor data:", sensorData);

        const user = await collection.findOne({email: userEmail}, {name:1, _id:0});
        // res.render("data", { latestData: latestData, sensorData: sensorData });
        res.render("data", { 
            latestData: latestData, 
            sensorData: sensorData,
            userName: user.name // Kirim nama user
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
        console.log("user maberhasil masuk db")
    }
})

// app.get("/login", (req, res) => {
//     res.render("login", { message: null });
// });

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
})