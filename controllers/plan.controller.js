
import PlanModel from '../models/plan.models.js';
import Exc from '../utils/exc.util.js'; // Optional: your async error wrapper
import UserModel from '../models/user.model.js';
import PaymentModel from '../models/payment.models.js';
import instance from '../config/razorpay.instance.js';
import crypto from 'crypto';


// Create a new plan
export const createPlan = Exc(async (req, res) => {
  const { name, price, credits, note } = req.body;

  const plan = await PlanModel.create({ name, price, credits, note });
  res.status(201).json({ success: true, message: 'Plan created', data: plan });
});

// Get all plans
export const getAllPlans = Exc(async (req, res) => {
  const plans = await PlanModel.find().sort({ createdAt: -1 });
  res.json({ success: true, data: plans });
});

// Get single plan by ID
export const getPlanById = Exc(async (req, res) => {
  const plan = await PlanModel.findById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  res.json({ success: true, data: plan });
});

// Update plan
export const updatePlan = Exc(async (req, res) => {
  const plan = await PlanModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  res.json({ success: true, message: 'Plan updated', data: plan });
});

// Delete plan
export const deletePlan = Exc(async (req, res) => {
  const plan = await PlanModel.findByIdAndDelete(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  res.json({ success: true, message: 'Plan deleted' });
});




export const checkout = Exc(async (req, res) => {
  const user = await UserModel.findById(req.user.id)
  const plan = await PlanModel.findById(req.params.id)

  const order = await instance.orders.create({
    amount: plan.price * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  });

  res.status(201).json({ order });
});


// === Payment Verification ===
export const paymentVerification = Exc(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;
  if (!isValid) {
    // ❌ Invalid Payment
    await PaymentModel.create({
      paymentId: razorpay_payment_id,
      user: req.user.id,
      plan: req.params.id,
      amount: 0,
      credits: 0,
      status: "failed",
    });
    return res.status(400).json({ message: "❌ Payment verification failed" });
  }

  // ✅ Valid Payment
  const user = await UserModel.findById(req.user.id);
  const plan = await PlanModel.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  // Save Payment Record
  await PaymentModel.create({
    paymentId: razorpay_payment_id,
    user: req.user.id,
    plan: plan._id,
    amount: plan.price,
    credits: plan.credits,
    status: "success",
  });

  // Update User
  if (!user.subscription.includes(plan._id)) {
    user.subscription.push(plan._id);
  }
  user.credits = (user.credits || 0) + (plan.credits || 0);
  await user.save();

  res.status(200).json({ message: "✅ Plan purchased successfully and credits added." });
});

