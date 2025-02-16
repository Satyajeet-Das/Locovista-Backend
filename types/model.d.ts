import { Doucument, Types } from "mongoose";

interface ICustomer extends Document {
    _id: Types.ObjectId,
    fullName: string,
    mobile: Number,
    DOB?: Date,
    email: string,
    password: string,
    profileImage: string,
    createdAt: Date,
    gender?: "Male" | "Female" | "Others",
}

