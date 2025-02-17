import mongoose, { Schema} from "mongoose";
import { IRetailer } from "../../types/model";
import bcrypt from "bcryptjs";  

// Define the BusinessType enum
export enum BusinessType {
    RETAIL = 'retail',
    WHOLESALE = 'wholesale',
    SERVICE = 'service',
    MANUFACTURER = 'manufacturer',
    DISTRIBUTOR = 'distributor',
    FRANCHISE = 'franchise',
    GROCERY = 'grocery',
    FASHION = 'fashion',
    ELECTRONICS = 'electronics',
    FURNITURE = 'furniture',
    AUTOMOTIVE = 'automotive',
    BEAUTY = 'beauty',
    HEALTH = 'health',
    FOOD_AND_BEVERAGE = 'food_and_beverage',
    BOOKSTORE = 'bookstore',
    ART = 'art',
    SPORTS = 'sports',
    TOYS = 'toys',
    JEWELRY = 'jewelry',
    PHARMACY = 'pharmacy',
}

export type BusinessTypeEnum = keyof typeof BusinessType;

const RetailerSchema: Schema = new Schema<IRetailer>(
{
  business_name: { type: String, required: true },
  owner_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  authOtp: { type: Number },
  authOtpExpiry: { type: Date },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  business_registration_certificate: { type: String, required: true }, // URL or reference to the certificate file
  gstin: { type: String, required: true }, // Goods and Services Tax Identification Number
  tin: { type: String }, // Taxpayer Identification Number (if applicable)
  bank_account_details: {
    bank_name: { type: String, required: true },
    account_number: { type: String, required: true },
    account_holder_name: { type: String, required: true },
    ifsc_code: { type: String, required: true },
  },
  trademark_registration: { type: String }, // URL or reference to trademark registration document (if applicable)
  lease_agreement: { type: String }, // URL or reference to lease agreement (if applicable)
  vendor_agreement: { type: String }, // URL or reference to the vendor agreement with the platform
  shipping_policy: { type: String }, // Shipping policy for the retailer
  returns_policy: { type: String}, // Returns and refund policy for the retailer
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  business_type: {
    type: [String],
    enum: Object.values(BusinessType),
    required: true,
    validate: {
      validator: function (types: string[]) {
        return types.length > 0; // Ensures at least one business type is selected
      },
      message: 'At least one business type must be selected.',
    },
  },
  transactions: [{
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
  },
  { timestamps: true }
);
RetailerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password as string, 8);
  }
  next();
});

RetailerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!candidatePassword) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};  

export default mongoose.model<IRetailer>('Retailer', RetailerSchema);
