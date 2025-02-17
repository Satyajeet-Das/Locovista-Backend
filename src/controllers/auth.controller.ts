import { Request, Response } from "express";
import Customer from "../models/customer";
import NewCustomer from "../models/newUser";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP";
import { sendOTP } from "../utils/sendSMS";
import "dotenv/config";

export const customerMobileSignUpOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile } = req.body;
        if(!mobile) {
            res.status(400).json({success: false, error: "Mobile number is required" });
            return;
        }

        const customer = await Customer.findOne({ mobile });
        if (customer) {
            res.status(400).json({success: false, error: "Mobile number already exists" });
            return;
        }

        // Send OTP to the mobile number
        const otp = generateOTP();
        const newCustomer = new NewCustomer({ mobile, otp, expiryOtp: new Date(Date.now() + 600000) });
        newCustomer.save();
        await sendOTP(mobile, otp.toString());

        res.status(200).json({success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, error: error.message });
    }
}

export const verifyCustomerMobileSignUpOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile, otp } = req.body;
        if(!mobile || !otp) {
            res.status(400).json({success: false, error: "Mobile number and OTP are required" });
            return;
        }

        const newCustomer = await NewCustomer.findOne({ mobile });
        if (!newCustomer) {
            res.status(400).json({success: false, error: "Mobile number not found" });
            return;
        }

        if (newCustomer.otp !== otp) {
            res.status(400).json({success: false, error: "Invalid OTP" });
            return;
        }

        if (new Date() > newCustomer.otpExpiry) {
            res.status(400).json({success: false, error: "OTP expired" });
            return;
        }

        const customer = new Customer({ mobile, authOtp: otp, authOtpExpiry: new Date(Date.now() + 600000) });
        await customer.save();
    
        res.status(200).json({success: true, message: "Mobile number verified successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, error: error.message });
    }
}




export const customerSignUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, email, password, mobile, dob, gender, profileImage, otp } = req.body;
        if(!fullName || !email || !password || !mobile) {
            res.status(400).json({success: false, error: "These fields are required" });
            return;
        }
        
        const customer = await Customer.findOne({ mobile });
        if (customer) {
            res.status(400).json({success: false, error: "Mobile number already exists" });
            return;
        }

        const newCustomer = await NewCustomer.findOne({ mobile, otp });
        if (!newCustomer) {
            res.status(400).json({success: false, error: "Otp Not Matched" });
            return;
        }
        
        if (new Date() > newCustomer.otpExpiry) {
            res.status(400).json({success: false, error: "OTP expired" });
            return;
        }

        await NewCustomer.deleteOne({ mobile });

        const registeredCustomer = new Customer({ fullName, email, password, mobile, dob, gender, profileImage });
        await registeredCustomer.save();
        const token = jwt.sign({ id: registeredCustomer._id }, process.env.JWT_SECRET as string);
        res.status(201).json({ success: true, token: token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }

}
export const customerLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, mobile } = req.body;
        if(!email && !mobile) {
            res.status(400).json({success: false, error: "Email or mobile number is required" });
            return;
        }
        if(!password) {
            res.status(400).json({success: false, error: "Password is required" });
            return;
        }
        if (email) {
            const customer = await Customer.findOne({ email });
            if (!customer) {
                res.status(400).json({success: false, error: "Email not found" });
                return;
            }
            if (customer.password !== password) {
                res.status(400).json({success: false, error: "Invalid password" });
                return;
            }
            const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET as string);
            res.status(200).json({ token });
        }
        if (mobile) {
            const customer = await Customer.findOne({ mobile });
            if (!customer) {
                res.status(400).json({success: false, error: "Mobile number not found" });
                return;
            }
            if (customer.password !== password) {
                res.status(400).json({ success: false, error: 'Invalid password' });
                return;
            }
            const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET as string)
            res.status(200).json({ token })
        }
            
        
    }catch (error: any) {
        res.status(400).json({ error: error.message });
    }
    }
export const customerLoginWithOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile, otp } = req.body;
        if(!mobile || !otp) {
            res.status(400).json({success: false, error: "Mobile number and OTP are required" });
            return;
        }
        const customer = await Customer.findOne({ mobile });
        if (!customer) {
            res.status(400).json({success: false, error: "Mobile number not found" });
            return;
        }
        if (customer.authOtp !== otp) {
            res.status(400).json({success: false, error: "Invalid OTP" });
            return;
        }
        if (!customer.authOtpExpiry ||new Date() > customer.authOtpExpiry) {
            res.status(400).json({success: false, error: "OTP expired" });
            return;
        }
        const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET as string);
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const customerForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, mobile } = req.body;
        if(!email && !mobile) {
            res.status(400).json({success: false, error: "Email or mobile number is required" });
            return;
        }
        if (email) {
            const customer = await Customer.findOne({ email });
            if (!customer) {
                res.status(400).json({success: false, error: "Email not found" });
                return;
            }
            const otp = generateOTP();
            customer.authOtp = otp;
            customer.authOtpExpiry = new Date(Date.now() + 600000);
            await customer.save();
            await sendOTP(customer.email, otp.toString());
            res.status(200).json({success: true, message: "OTP sent successfully" });
        }
    }
    catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

// Get customer by Id
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customer.findById(req.params.id);
        res.status(200).json({ success: true, data: customer });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

// Update customer by Id
export const updateCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: customer });
    }
    catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}


//customer reset password after verfiying otp
export const customerResetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, mobile, otp, password } = req.body;
        if(!email && !mobile) {
            res.status(400).json({success: false, error: "Email or mobile number is required" });
            return;
        }
        if(!otp) {
            res.status(400).json({success: false, error: "OTP is required" });
            return;
        }
        if(!password) {
            res.status(400).json({success: false, error: "Password is required" });
            return;
        }
        if (email) {
            const customer = await Customer.findOne({ email });
            if (!customer) {
                res.status(400).json({success: false, error: "Email not found" });
                return;
            }
            if (customer.authOtp !== otp) {
                res.status(400).json({success: false, error: "Invalid OTP" });
                return;
            }
            if (!customer.authOtpExpiry || new Date() > customer.authOtpExpiry) {
                res.status(400).json({success: false, error: "OTP expired" });
                return;
            }
            customer.password = password;
            await customer.save();
            res.status(200).json({success: true, message: "Password reset successfully" });
        }
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
