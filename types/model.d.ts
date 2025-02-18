import { Doucument, Types } from "mongoose";
import { ProductCategory } from "./constants";

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

interface IRetailer extends Document {
  _id: Types.ObjectId,
  fullName: string,
  mobile: Number,
  email: string,
  password: string,
  profileImage: string,
  bussinessName: string,
  address: {
    street: string,
    city: string,
    state: string,
    postal_code: string,
    country: string
  }

  createdAt: Date,
  authOtp?: number,
  authOtpExpiry?: Date,
  comparePassword: (candidatePassword: string) => Promise<boolean>
}

interface IReview {
  user: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

interface IProduct extends Document {
  _id: Types.ObjectId;               // Unique ID for the product
  name: string;                       // Product name
  description: string;                // Detailed description of the product
  category: ProductCategory;        // Category the product belongs to
  price: number;                      // Regular price of the product
  discountPrice?: number;             // Discounted price, optional
  discountPercentage?: number;        // Discount percentage, optional
  stockQuantity: number;              // Available stock quantity
  retailerId: Types.ObjectId;         // Reference to the retailer/shop
  images: string[];                   // List of image URLs for the product
  rating: number;                     // Average rating of the product (from 0 to 5)
  reviews: IReview[];                 // Array of reviews for the product
  createdAt: Date;                    // Date when the product was added
  updatedAt?: Date;                   // Date when the product was last updated (optional)
}

