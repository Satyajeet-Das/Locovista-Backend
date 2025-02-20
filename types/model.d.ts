import { Doucument, Types } from "mongoose";
import { ProductCategory } from "./constants";
import { BussinessCategory } from "./constants";
import { ServiceCategory } from "./constants";

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

interface INewCustomer extends Document {
  _id: Types.ObjectId,
  mobile: Number,
  otp: Number,
  otpExpiry: Date,
}

export interface BankAccountDetails {
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  ifsc_code: string;
}

interface INewRetailer extends Document {
  _id: Types.ObjectId,
  mobile: Number,
  otp: Number,
  otpExpiry: Date,
}

interface IRetailer extends Document {
  _id: Types.ObjectId;
  business_name: string;
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  profileImage: string;
  authOtp?: number;
  authOtpExpiry?: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    location?: {
      type: string;
      coordinates: [number, number];
    }
  };
  products: Types.ObjectId[]; // Array of product ObjectIds
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
  services: Types.ObjectId[]; // Array of service types provided by the retailer
  transactions: Types.ObjectId[]; // Array of transaction ObjectIds
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

interface IReview {
    user: Types.ObjectId;
    comment: string;
    rating: number;
    productId: Types.ObjectId;
    retailerId: Types.ObjectId;
    serviceId: Types.ObjectId;
    createdAt: Date;
  }
  
  interface IProduct extends Document {
    _id: Types.ObjectId;               // Unique ID for the product
    name: string;                       // Product name
    description: string;                // Detailed description of the product
    category: ProductCategory;        // Category the product belongs to
    mrp: number;                      // Regular price of the product
    sellingPrice: number;             // Selling price of the product
    discountPercentage?: number;        // Discount percentage, optional
    stockQuantity: number;              // Available stock quantity
    images: string[];                   // List of image URLs for the product
    overallRating: number;                     // Average rating of the product (from 0 to 5)
    createdAt: Date;                    // Date when the product was added
    updatedAt?: Date;                   // Date when the product was last updated (optional)
  }

  interface IService extends Document {
  retailerId: Types.ObjectId; // Reference to the retailer offering the service
  name: string;
  description: string;
  rating: Number;
  price: number;
  category: ServiceCategory;
  duration?: string; // Optional (e.g., "30 minutes", "2 hours")
  availability: boolean; // Indicates if the service is currently available
  }