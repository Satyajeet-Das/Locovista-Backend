import mongoose, { Schema } from "mongoose";
import { IService } from "../../types/model";
const ServiceSchema: Schema = new Schema<IService>({
    retailerId: { type: Schema.Types.ObjectId, ref: "Retailer", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    rating: {
        type:Number
    },
    duration: { type: String },
    availability: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IService>("Service", ServiceSchema);