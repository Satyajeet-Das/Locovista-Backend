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