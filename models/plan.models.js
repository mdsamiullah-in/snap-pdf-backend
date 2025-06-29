import { Schema, model } from 'mongoose';

const planSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    default: 0,
  },
  note: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const PlanModel = model('Plan', planSchema);

export default PlanModel;
