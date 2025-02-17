import { Doucument, Types } from "mongoose";
import { BusinessTypeEnum } from '../src/models/retailer';
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

export interface BankAccountDetails {
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  ifsc_code: string;
}

interface IRetailer extends Document {
  _id: Types.ObjectId;
  business_name: string;
  owner_name: string;
  email: string;
  password: string;
  phone: string;
  authOtp?: number;
  authOtpExpiry?: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  business_registration_certificate: string; // URL or reference to the certificate file
  gstin: string; // Goods and Services Tax Identification Number
  tin?: string; // Taxpayer Identification Number (if applicable)
  bank_account_details: BankAccountDetails;
  trademark_registration?: string; // URL or reference to trademark registration document (if applicable)
  lease_agreement?: string; // URL or reference to lease agreement (if applicable)
  vendor_agreement: string; // URL or reference to the vendor agreement with the platform
  shipping_policy: string; // Shipping policy for the retailer
  returns_policy: string; // Returns and refund policy for the retailer
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'inactive' | 'suspended'; // Status of the retailer account
  business_type: BusinessTypeEnum[]; // e.g. 'wholesale', 'retail', etc.
  transactions: Types.ObjectId[]; // Array of transaction ObjectIds
}