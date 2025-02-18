import mongoose, { Schema } from 'mongoose'
import { IProduct } from '../../types/model'
import { ProductCategory } from '../../types/constants'

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: Object.values(ProductCategory), required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    discountPercentage: { type: Number },
    // Max Length 10
    images: [
      {
        type: String,
        required: true,
        validate: [
          {
            validator: (val: string[]): boolean => val.length <= 10,
            message: "Maximum 10 images are allowed"
          }
        ]
      }
    ],
    stockQuantity: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model<IProduct>('Product', ProductSchema)
