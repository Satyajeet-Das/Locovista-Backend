import mongoose, { Schema } from 'mongoose'
import { INewCustomer } from '../../types/model'

const NewCustomerSchema: Schema = new Schema<INewCustomer>(
  {
        mobile: { type: String, required: true },
        otp: { type: Number, required: true },
        otpExpiry: { type: Date, required: true },
  },
  { timestamps: true }
)
NewCustomerSchema.pre('save', async function (next) {
  next()
})

export default mongoose.model<INewCustomer>('NewCustomer', NewCustomerSchema)
