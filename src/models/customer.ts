import mongoose, { Schema } from 'mongoose';
import { ICustomer } from '../../types/model';
import bcrypt from 'bcryptjs'

const CustomerSchema: Schema = new Schema<ICustomer>(
  {
    fullName: { type: String, required: true },
    mobile: { type: Number, required: true, unique: true },
    dob: { type: Date },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    gender: { type: String, enum: ['Male', 'Female', 'Others'] },
    authOtp: { type: Number },
    authOtpExpiry: { type: Date }
  },
  { timestamps: true }
)
CustomerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password as string, 8)
  }

  next()
})

export default mongoose.model<ICustomer>('Customer', CustomerSchema)
