import mongoose, { Schema } from 'mongoose'
import { INewRetailer } from '../../types/model'

const NewRetailerSchema: Schema = new Schema<INewRetailer>(
  {
        mobile: { type: String, required: true },
        otp: { type: Number, required: true },
        otpExpiry: { type: Date, required: true },
  },
  { timestamps: true }
)
NewRetailerSchema.pre('save', async function (next) {
  next()
})

export default mongoose.model<INewRetailer>('NewRetailer', NewRetailerSchema);