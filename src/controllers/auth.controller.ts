import { Request, Response } from "express";
import Customer from "../models/customer";
import NewCustomer from "../models/newUser";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP";
import { ConvertToMongoId } from "../utils/helper";
import { sendOTP } from "../utils/sendSMS";
import "dotenv/config";

export const customerMobileSignUpOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile }: { mobile: string } = req.body;
        if (!mobile) {
            res.status(400).json({ success: false, message: "Mobile number is required" });
            return;
        }

        const customer = await Customer.findOne({ mobile });

        if (customer) {
            res.status(400).json({success: false, message: "Mobile number already exists" });
            return;
        }

        // Send OTP to the mobile number
        const otp = generateOTP();
        // const newCustomer = new NewCustomer({ mobile, otp, otpExpiry: new Date(Date.now() + 600000) });
        await NewCustomer.findOneAndUpdate({ mobile }, { otp, otpExpiry: new Date(Date.now() + 600000) }, { upsert: true });
        console.log(mobile.toString(),otp.toString());
        await sendOTP(mobile.toString(), otp.toString());

        res.status(200).json({success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, message: error });
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
        console.log(newCustomer);
        if (!newCustomer) {
            res.status(400).json({success: false, message: "Mobile number not found" });
            return;
        }

        if (newCustomer.otp !== otp) {
            res.status(400).json({success: false, message: "Invalid OTP" });
            return;
        }

        if (new Date() > newCustomer.otpExpiry) {
            res.status(400).json({success: false, message: "OTP expired" });
            return;
        }

        // const customer = new Customer({ mobile, authOtp: otp, authOtpExpiry: new Date(Date.now() + 600000) });
        // await customer.save();
        await NewCustomer.findByIdAndUpdate(newCustomer._id, {otpExpiry: new Date(Date.now() + 6000000)});
        res.status(200).json({success: true, message: "Mobile number verified successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, message: error.message });
        console.log(error);
    }
}




export const customerSignUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, email, password, mobile, dob, gender, profileImage, otp } = req.body;
        if(!fullName || !email || !password || !mobile) {
            res.status(400).json({success: false, message: "These fields are required" });
            return;
        }
        
        const customer = await Customer.findOne({ mobile });
        if (customer) {
            res.status(400).json({success: false, message: "Mobile number already exists" });
            return;
        }

        const newCustomer = await NewCustomer.findOne({ mobile, otp });
        if (!newCustomer) {
            res.status(400).json({success: false, message: "Otp Not Matched" });
            return;
        }
        
        if (new Date() > newCustomer.otpExpiry) {
            res.status(400).json({success: false, message: "OTP expired" });
            return;
        }

        await NewCustomer.deleteOne({ mobile });

        const registeredCustomer = new Customer({ fullName, email, password, mobile, dob, gender, profileImage });
        await registeredCustomer.save();
        const token = jwt.sign({ id: registeredCustomer._id }, process.env.JWT_SECRET as string);
        res.status(201).json({ success: true, message: "User Signed Up Successfully", token: token });
    } catch (error: any) {
        res.status(400).json({success: false, message: error.message });
    }

}
export const customerLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, mobile } = req.body;
        if(!email && !mobile) {
            res.status(400).json({success: false, message: "Email or mobile number is required" });
            return;
        }
        if(!password) {
            res.status(400).json({success: false, message: "Password is required" });
            return;
        }
        if (email) {
            const customer = await Customer.findOne({ email });
            if (!customer) {
                res.status(400).json({success: false, message: "Email not found" });
                return;
            }
            const isMatched = await customer.comparePassword(password);
            if (!isMatched) {
                res.status(400).json({ success: false, message: 'Invalid password' });
                return;
            }
            const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET as string);
            res.status(200).json({ token });
        }
        if (mobile) {
            const customer = await Customer.findOne({ mobile });
            if (!customer) {
                res.status(400).json({success: false, message: "Mobile number not found" });
                return;
            }
            const isMatched = await customer.comparePassword(password);
            if (!isMatched) {
                res.status(400).json({ success: false, message: 'Invalid password' });
                return;
            }
            const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET as string)
            res.status(200).json({ customer, token })
        }
            
        
    }catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const customerMobileLoginOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile }: { mobile: string } = req.body;
        if (!mobile) {
            res.status(400).json({ success: false, message: "Mobile number is required" });
            return;
        }

        const customer = await Customer.findOne({ mobile });

        if (!customer) {
            res.status(400).json({success: false, message: "Mobile number not found" });
            return;
        }

        // Send OTP to the mobile number
        const otp = generateOTP();
        // const newCustomer = new NewCustomer({ mobile, otp, otpExpiry: new Date(Date.now() + 600000) });
        await Customer.findOneAndUpdate({ mobile }, { authOtp:otp, authOtpExpiry: new Date(Date.now() + 600000) }, { upsert: true });
        console.log(mobile.toString(),otp.toString());
        await sendOTP(mobile.toString(), otp.toString());

        res.status(200).json({success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, message: error });
    }
}
export const LoginOtpVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile, otp } = req.body;
        if(!mobile || !otp) {
            res.status(400).json({success: false, message: "Mobile number and OTP are required" });
            return;
        }
        const customer = await Customer.findOne({ mobile });
        if (!customer) {
            res.status(400).json({success: false, message: "Mobile number not found" });
            return;
        }
        // if (customer.authOtp !== otp) {
        //     res.status(400).json({success: false, message: "Invalid OTP" });
        //     return;
        // }
        // if (!customer.authOtpExpiry ||new Date() > customer.authOtpExpiry) {
        //     res.status(400).json({success: false, message: "OTP expired" });
        //     return;
        // }
        const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET as string);
        res.status(200).json({ success: true, message: "User Login Successful", customer, token });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const customerForgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, mobile } = req.body;
    
    // Validate if at least one field (email or mobile) is provided
    if (!email && !mobile) {
      res.status(400).json({ success: false, error: "Email or mobile number is required" });
      return;
    }

    let customer;
    
    // Find customer by email if provided
    if (email) {
      customer = await Customer.findOne({ email });
    }

    // If email is not provided, find by mobile if provided
    if (!customer && mobile) {
      customer = await Customer.findOne({ mobile });
    }

    // If customer not found, return error
    if (!customer) {
      res.status(400).json({ success: false, error: "Customer not found" });
      return;
    }

    // Generate OTP
    const otp = generateOTP();

    // Set OTP and expiry time
    customer.authOtp = otp;
    customer.authOtpExpiry = new Date(Date.now() + 600000); // OTP expires in 10 minutes

    // Save the OTP to the customer record
    await Customer.findByIdAndUpdate(customer._id, { authOtp: otp, authOtpExpiry: customer.authOtpExpiry });

    // Send OTP to customer (via email or mobile)
    await sendOTP(customer.mobile.toString(), otp.toString()); // Assuming email is used for sending OTP

    // Return success message
    res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// Get customer by Id
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const CustomerId = ConvertToMongoId(req.params.id);
        const customer = await Customer.findById(CustomerId).select("-authOtp -authOtpExpiry -password");
        res.status(200).json({ success: true, data: customer });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

//update customer by id with security so that password can not be changed
export const updateCustomerByIdWithSecurity = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
        const fieldsToRemove = ['password', 'mobile', 'authOtp', 'authOtpExpiry']

        // Remove sensitive fields from request body
        fieldsToRemove.forEach((field) => {
        if (req.body[field]) {
            delete req.body[field]
        }
        })
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedCustomer });
        } else {
            res.status(400).json({ success: false, message: "Customer not found" });
        }
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// Update customer by Id
export const updateCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-authOtp -authOtpExpiry -password");
        res.status(200).json({ success: true, data: customer });
    }
    catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

//customer reset password for verfiying otp
export const customerResetPasswordVerifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile, otp } = req.body;
        if(!mobile) {
            res.status(400).json({success: false, message: "Mobile number is required" });
            return;
        }
        if(!otp) {
            res.status(400).json({success: false, message: "OTP is required" });
            return;
        }
        const customer = await Customer.findOne({ mobile });
        if (!customer) {
            res.status(400).json({success: false, message: "Mobile number not found" });
            return;
        }
        if (customer.authOtp !== otp) {
            res.status(400).json({success: false, message: "Invalid OTP" });
            return;
        }   
        if (!customer.authOtpExpiry || new Date() > customer.authOtpExpiry) {
            res.status(400).json({success: false, message: "OTP expired" });
            return;
        }
        await Customer.findOneAndUpdate({ mobile }, { authOtp: otp, authOtpExpiry: new Date(Date.now() + 600000) }, { upsert: true })
        res.status(200).json({success: true, message: "OTP Verified successfully" });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}
//customer reset password after verfiying otp
export const customerResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, mobile, otp, password } = req.body

    // Validate that either email or mobile is provided
    if (!email && !mobile) {
      res.status(400).json({ success: false, message: 'Email or mobile number is required' });
      return;
    }

    // Validate that OTP and password are provided
    if (!otp) {
        res.status(400).json({ success: false, message: 'OTP is required' });
        return;
    }

    if (!password) {
        res.status(400).json({ success: false, message: 'Password is required' });
        return;
    }

    let customer;

    // Look up the customer by email or mobile
    if (email) {
      customer = await Customer.findOne({ email })
    }

    if (!customer && mobile) {
      customer = await Customer.findOne({ mobile })
    }

    // Check if the customer exists
    if (!customer) {
        res.status(400).json({ success: false, message: 'Customer not found' });
        return;
    }

    // Check if OTP is valid
    if (customer.authOtp !== otp) {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
        return;
    }

    // Check if OTP has expired
    if (!customer.authOtpExpiry || new Date() > customer.authOtpExpiry) {
        res.status(400).json({ success: false, message: 'OTP expired' });
        return;
    }

    // Save the updated password
      await customer.save();

    // Respond with success message
    res.status(200).json({ success: true, message: 'Password reset successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

