import mongoose, { Schema } from "mongoose";
import { ICustomer } from "../../types/model";

const CustomerSchema: Schema = new Schema<ICustomer>(
    {
        fullName: { type: String, required: true },
        mobile: { type: Number, required: true, unique: true },
        DOB: { type: Date },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profileImage: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
        gender: { type: String, enum: ["Male", "Female", "Others"] },
    },
    { timestamps: true }
);
CustomerSchema.pre("save", async function (next){
    next();
});

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
