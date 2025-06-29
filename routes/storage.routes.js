import express from 'express';
import multer from "multer";
const upload = multer(); // For parsing multipart/form-data

const storageRouter = express.Router();

import { 
  uploadPdf, 
  getUserPdfs, 
  deletePdf, 
  updatePdf, 
  uploadProfileImage,
  getPdfById
} from "../controllers/storage.controller.js";

import { UserGuard, AdminUserGuard } from '../middlewares/user.middlewares.js';

// 📤 Upload a PDF
storageRouter.post("/create", AdminUserGuard, upload.single("path"), uploadPdf);

// 📥 Get all PDFs of logged-in user
storageRouter.get("/all", AdminUserGuard, getUserPdfs);

storageRouter.get('/:id', AdminUserGuard, getPdfById);

// 🗑️ Delete a PDF by ID
storageRouter.delete("/:id", AdminUserGuard, deletePdf);

// ✏️ Update PDF title
storageRouter.put("/:id", AdminUserGuard, updatePdf);

storageRouter.post('/upload-logo', AdminUserGuard, upload.single('image'), uploadProfileImage)


export default storageRouter;
