

// import multer from "multer";
// import path from "path";
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../server/uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|webp/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowedTypes.test(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
//     }
//   };
// const upload = multer({
//   storage,
//   limits: {
//     fieldSize: 5 * 1024 * 1024, // 5 MB per field (increase as needed)
//     fileSize: 10 * 1024 * 1024, // 10 MB per file
//     files: 10, // Max 10 files
//     fields: 50, // Max 50 non-file fields
//   },
//   fileFilter
// });

// export default upload;

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current file path context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ ABSOLUTE PATH to /uploads
const uploadPath = path.join(__dirname, "../uploads");

// ✅ Ensure uploads folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Optional: Restrict file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // ✅ Absolute path
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 5 * 1024 * 1024,
    fileSize: 10 * 1024 * 1024,
    files: 10,
    fields: 50,
  },
  // fileFilter,
});

export default upload;

