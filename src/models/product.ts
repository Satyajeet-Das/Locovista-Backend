import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../../types/model';
import { ProductCategory } from '../../types/constants';

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: Object.values(ProductCategory), required: true },
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true, default: function () { return this.mrp; } }, // Correct the default behavior
    discountPercentage: { type: Number, min:0,max: 100 },
    // Max Length 10
    images: {
      type: [String], // Define the type as an array of strings
      required: true,
      validate: {
        validator: (val: string[]): boolean => val.length <= 10,
        message: 'Maximum 10 images are allowed'
      }
    },
    stockQuantity: { type: Number, required: true },
    overallRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
