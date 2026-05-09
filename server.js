const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
const FormData = require("form-data");

const app = express();

// =====================
// ✅ FIX CORS
// =====================
app.use(cors({ origin: "*" }));

app.use(express.json());

// =====================
// 📦 upload setup
// =====================
const upload = multer({ dest: "/tmp" });

// =====================
// 🚀 UPLOAD VIDEO
// =====================
app.post("/upload-video", upload.single("file"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        // ✅ convert file → FormData (IMPORTANT FIX 422)
        const form = new FormData();

        form.append(
            "file",
            fs.createReadStream(req.file.path),
            req.file.originalname
        );

        // 🤖 send to Python AI
        const result = await axios.post(
            "https://ai-ouub.onrender.com/video-dub",
            form,
            {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );

        return res.json(result.data);

    } catch (err) {

        console.log("ERROR:", err.response?.data || err.message);

        return res.status(500).json({
            error: "Server failed",
            detail: err.message
        });
    }
});

// =====================
// 🎥 serve files
// =====================
app.use("/files", express.static("/tmp"));

// =====================
// 🚀 start server
// =====================
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
