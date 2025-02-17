import { Doucument, Types } from "mongoose";

interface ICustomer extends Document {
    _id: Types.ObjectId,
    fullName: string,
    mobile: Number,
    dob?: Date,
    email: string,
    password: string,
    profileImage: string,
    createdAt: Date,
    gender?: "Male" | "Female" | "Others",
    authOtp?: number,
    authOtpExpiry?: Date,
    comparePassword: (candidatePassword: string) => Promise<boolean>;
}

interface INewCustomer extends Document{
    _id: Types.ObjectId,
    mobile: Number,
    otp: Number,
    otpExpiry: Date,
}

interface IRetailer extends Document {
  _id: Types.ObjectId
  fullName: string
  mobile: Number
  email: string
  password: string
  profileImage: string
  bussinessName: string
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }

  createdAt: Date
  authOtp?: number
  authOtpExpiry?: Date
  comparePassword: (candidatePassword: string) => Promise<boolean>
}