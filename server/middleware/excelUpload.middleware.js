import multer from "multer";

const excelStorage = multer.memoryStorage(); // Use memory buffer for XLSX

const excelFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true);
  } else {
    cb(new Error("Only Excel .xlsx files are allowed"), false);
  }
};

const excelUpload = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max Excel file size
  },
});

export default excelUpload;
