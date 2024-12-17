const mongoose = require("mongoose");

// Koneksi ke MongoDB Atlas
const uri = "mongodb+srv://admin:6969@iot-logger.24cd3.mongodb.net/iot-logger?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("MongoDB connected successfully!");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Skema untuk login (users)
const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Skema untuk data sensor
const sensorSchema = new mongoose.Schema({
    humidity: Number,
    nitrogen: Number,
    phospor: Number,
    kalium: Number,
    temperature: Number,
    ph: Number,
    conductivity: Number,
    date: String,
    user_email: String // Menyimpan email user
});

// Membuat model dari skema
const collection = mongoose.model("users", loginSchema);
const SensorData = mongoose.model("SensorData", sensorSchema, "data");

// Ekspor model
module.exports = {
    collection,   // Model untuk users
    SensorData    // Model untuk data sensor
};
