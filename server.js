const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");

const app = express();

// =======================
// ✅ CORS FIX (IMPORTANT)
// =======================
app.use(cors({
    origin: "*"
}));

app.use(express.json());

// =======================
// 📦 FILE UPLOAD SETUP
// =======================
const upload = multer({ dest: "/tmp" });

// =======================
// 📤 UPLOAD VIDEO ROUTE
// =======================
app.post("/upload-video", upload.single("file"), async (req, res) => {

    try {

        // ❌ check file
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        // 📂 read file
        const file = fs.readFileSync(req.file.path);

        // 🤖 send to Python AI
        const result = await axios.post(
            "https://ai-ouub.onrender.com/video-dub",
            file,
            {
                headers: {
                    "Content-Type": "application/octet-stream"
                }
            }
        );

        // ✅ return result
        return res.json(result.data);

    } catch (err) {

        console.log("ERROR:", err.message);

        return res.status(500).json({
            error: "Server error",
            detail: err.message
        });
    }
});

// =======================
// 🎥 SERVE FILES
// =======================
app.use("/files", express.static("/tmp"));

// =======================
// 🚀 START SERVER
// =======================
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
