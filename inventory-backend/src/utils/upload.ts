import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const uploadMultiple = multer({
  storage,
  limits: { files: 5 },
}).array("images", 5);


const diskStorage = multer.diskStorage({
  destination : "./uploads/",
  filename : (_,file,cb) => {
    cb(null,Date.now() + path.extname(file.originalname));
  }
})

export const uploadFile = multer({ storage : diskStorage });