import { Schema, model } from 'mongoose'

const paymentModel = new Schema({
   paymentId: {
      type: String,
   },
   user: {
      type: Schema.Types.ObjectId,
      ref: "User"
   },
   plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan"
   },
   amount: {
      type: Number
   },
   credits: {
      type: Number
   },
   status: {
      type: String,
      enum: ["success", "failed"],
      default: "success"
   },
}, { timestamps: true })

const PaymentModel = model("Payment", paymentModel)
export default PaymentModel