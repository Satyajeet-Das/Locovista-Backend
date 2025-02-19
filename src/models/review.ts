import mongoose, { Schema } from 'mongoose'
import { IReview } from '../../types/model'

const ReviewSchema: Schema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true },
  },
  { timestamps: true }
)

export default mongoose.model<IReview>('Review', ReviewSchema)