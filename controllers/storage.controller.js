import StorageModel from "../models/storage.models.js";
import Exc from "../utils/exc.util.js";
import bufferGenerator from '../utils/bufferGenerator.utils.js';
import { v2 as cloudinary } from 'cloudinary';
import UserModel from "../models/user.model.js";

/**
 * Upload a PDF
 */
export const uploadPdf = Exc(async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file to upload!" });

  // 🛡 Get user and check existence
  const user = await UserModel.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found!" });

  // 🛡 Skip credit check for admin
  const isAdmin = user.role === "admin";

  if (!isAdmin && user.credits <= 0) {
    return res.status(403).json({ message: "Insufficient credits!" });
  }

  // ✅ Upload to Cloudinary
  const fileBuffer = bufferGenerator(file);

  const result = await cloudinary.uploader.upload(fileBuffer.content, {
    resource_type: "auto",
    type: "upload",
    public_id: `pdfs/${Date.now()}_${file.originalname}`,
  });

  // 🧾 Save the uploaded PDF
  const newPdf = new StorageModel({
    title,
    path: result.url,
    cloudinaryId: result.public_id,
    user: req.user.id,
  });

  await newPdf.save();

  // 🧮 Update usedCredits only for non-admins
  if (!isAdmin) {
    user.usedCredits += 1;
    await user.save();
  }

  res.status(201).json({ message: "PDF uploaded successfully!", data: newPdf });
});

/**
 * Fetch all PDFs of a user
 */
export const getUserPdfs = Exc(async (req, res) => {
  const userId = req.user.id;

  const pdfs = await StorageModel.find({ user: userId }).sort({ createdAt: -1 });

  res.status(200).json({ message: "PDFs fetched successfully", data: pdfs });
});


/**
 * Get a single PDF by ID (for the logged-in user)
 */
export const getPdfById = Exc(async (req, res) => {
  const { id } = req.params;

  const pdf = await StorageModel.findOne({ _id: id, user: req.user.id });
  if (!pdf) return res.status(404).json({ message: "PDF not found or unauthorized" });

  res.status(200).json({ message: "PDF fetched successfully", data: pdf });
});



/**
 * Delete a PDF by ID
 */
export const deletePdf = Exc(async (req, res) => {
  const { id } = req.params;

  const pdf = await StorageModel.findById(id);
  if (!pdf) return res.status(404).json({ message: "PDF not found" });

  if (pdf.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  // Delete from DB
  await StorageModel.findByIdAndDelete(id);

  res.status(200).json({ message: "PDF deleted successfully" });
});

/**
 * Update PDF Title
 */
export const updatePdf = Exc(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const pdf = await StorageModel.findById(id);
  if (!pdf) return res.status(404).json({ message: "PDF not found" });

  if (pdf.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  pdf.title = title || pdf.title;
  await pdf.save();

  res.status(200).json({ message: "PDF updated successfully", data: pdf });
});

/**
 * Upload image (example)
 */
export const uploadProfileImage = Exc(async (req, res) => {
  const file = req.file

  if (!file) {
    return res.status(400).json({ message: 'No image file provided' })
  }

  // Upload to Cloudinary using buffer
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(base64Image, {
    public_id: `user_${req.user.id}_${Date.now()}`
  })

  // Save image URL in user document
  const user = await UserModel.findByIdAndUpdate(
    req.user.id,
    { image: result.secure_url },
    { new: true }
  )

  res.json({ message: 'Image uploaded successfully', image: user.image })
})