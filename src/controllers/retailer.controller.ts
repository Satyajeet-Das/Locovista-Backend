import { Request, Response } from "express";
import Retailer  from "../models/retailer";
import NewRetailer from "../models/newRetailer";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP";
import { sendOTP } from "../utils/sendSMS";
import "dotenv/config";

export const retailerMobileSignUpOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile }: { mobile: string } = req.body;
        if (!mobile) {
            res.status(400).json({ success: false, error: "Mobile number is required" });
            return;
        }

        const retailer = await Retailer.findOne({ mobile });

        if (retailer) {
            res.status(400).json({success: false, error: "Mobile number already exists" });
            return;
        }

        // Send OTP to the mobile number
        const otp = generateOTP();
        await NewRetailer.findOneAndUpdate({ mobile }, { otp, otpExpiry: new Date(Date.now() + 600000) }, { upsert: true });
        console.log(mobile.toString(),otp.toString());
        await sendOTP(mobile.toString(), otp.toString());

        res.status(200).json({success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, error: error });
    }
}

export const verifyRetailerMobileSignUpOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile, otp } = req.body;
        if(!mobile || !otp) {
            res.status(400).json({success: false, error: "Mobile number and OTP are required" });
            return;
        }

        const newRetailer = await NewRetailer.findOne({ mobile });
        console.log(newRetailer);
        if (!newRetailer) {
            res.status(400).json({success: false, error: "Mobile number not found" });
            return;
        }

        if (newRetailer.otp !== otp) {
            res.status(400).json({success: false, error: "Invalid OTP" });
            return;
        }

        if (new Date() > newRetailer.otpExpiry) {
            res.status(400).json({success: false, error: "OTP expired" });
            return;
        }

        await NewRetailer.findByIdAndUpdate(newRetailer._id, {otpExpiry: new Date(Date.now() + 6000000)});
        res.status(200).json({success: true, message: "Mobile number verified successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, error: error.message });
    }
}



export const retailerSignUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            business_name, fullName, email, password, mobile, profileImage,
            otp, address, business_registration_certificate, gstin,
            bank_account_details, business_type
        } = req.body;
        if (!business_name || !fullName || !email || !password || !mobile ||
            !address || !address.street || !address.city || !address.state ||
            !address.postal_code || !address.country ||
            !business_registration_certificate || !gstin ||
            !bank_account_details || !bank_account_details.bank_name ||
            !bank_account_details.account_number || !bank_account_details.account_holder_name ||
            !bank_account_details.ifsc_code || !business_type) {
            res.status(400).json({ success: false, error: "All required fields must be provided" });
            return;
        }


        // Check if retailer already exists
        const existingRetailer = await Retailer.findOne({ email });
        if (existingRetailer) {
            res.status(400).json({ success: false, error: "Email already registered" });
            return;
        }

        // Validate OTP
        const newRetailer = await NewRetailer.findOne({ mobile, otp });
        if (!newRetailer) {
            res.status(400).json({ success: false, error: "Invalid OTP" });
            return;
        }

        if (new Date() > newRetailer.otpExpiry) {
            res.status(400).json({ success: false, error: "OTP expired" });
            return;
        }

        // Delete OTP record after successful verification
        
        
        // Create new retailer
        const newRetailerData = new Retailer({
            business_name, fullName, email, password, mobile,
            profileImage, address, business_registration_certificate, gstin,
            bank_account_details, business_type
        });
        
        await newRetailerData.save();
        await NewRetailer.deleteOne({ mobile });

        // Generate JWT token
        const token = jwt.sign({ id: newRetailerData._id }, process.env.JWT_SECRET as string);

        res.status(201).json({ success: true, token, retailer: newRetailerData });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// set location for store
// export const setLocation = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { latitude, longitude } = req.body;
//         const retailer = await Retailer.findById(req.params.id);
//         if (!retailer) {
//             res.status(400).json({ success: false, error: "Retailer not found" });
//             return;
//         }
//         if (!latitude || !longitude) {
//             res.status(400).json({ success: false, error: "Latitude and longitude are required" });
//             return;
//         }
//         await Retailer.findByIdAndUpdate(req.params.id, { address: { ...retailer.address, latitude, longitude } });
//         res.status(200).json({ success: true, message: "Location set successfully" });
//     } catch (error: any) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };
export const retailerLogin = async (req: Request, res: Response): Promise<void> => {
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
            const retailer = await Retailer.findOne({ email });
            if (!retailer) {
                res.status(400).json({success: false, error: "Email not found" });
                return;
            }
            const isMatched = await retailer.comparePassword(password);
            if (!isMatched) {
                res.status(400).json({ success: false, error: 'Invalid password' });
                return;
            }
            const token = jwt.sign({ id: retailer._id }, process.env.JWT_SECRET as string);
            res.status(200).json({ token });
        }
        if (mobile) {
            const retailer = await Retailer.findOne({ mobile });
            if (!retailer) {
                res.status(400).json({success: false, error: "Mobile number not found" });
                return;
            }
            const isMatched = await retailer.comparePassword(password);
            if (!isMatched) {
                res.status(400).json({ success: false, error: 'Invalid password' });
                return;
            }
            const token = jwt.sign({ id:  retailer._id }, process.env.JWT_SECRET as string)
            res.status(200).json({ token })
        }
            
        
    }catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const retailerMobileLoginOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile }: { mobile: string } = req.body;
        if (!mobile) {
            res.status(400).json({ success: false, error: "Mobile number is required" });
            return;
        }

        const retailer = await Retailer.findOne({ mobile });

        if (!retailer) {
            res.status(400).json({success: false, error: "Mobile number not found" });
            return;
        }

        // Send OTP to the mobile number
        const otp = generateOTP();
        // const newCustomer = new NewCustomer({ mobile, otp, otpExpiry: new Date(Date.now() + 600000) });
        await Retailer.findOneAndUpdate({ mobile }, { authOtp:otp, authOtpExpiry: new Date(Date.now() + 600000) }, { upsert: true });
        console.log(mobile.toString(),otp.toString());
        await sendOTP(mobile.toString(), otp.toString());

        res.status(200).json({success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        res.status(400).json({success: false, error: error });
    }
}
export const retailerOtpVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile, otp } = req.body;
        if(!mobile || !otp) {
            res.status(400).json({success: false, error: "Mobile number and OTP are required" });
            return;
        }
        const retailer = await Retailer.findOne({ mobile });
        if (!retailer) {
            res.status(400).json({success: false, error: "Mobile number not found" });
            return;
        }
        if (retailer.authOtp !== otp) {
            res.status(400).json({success: false, error: "Invalid OTP" });
            return;
        }
        if (!retailer.authOtpExpiry ||new Date() > retailer.authOtpExpiry) {
            res.status(400).json({success: false, error: "OTP expired" });
            return;
        }
        const token = jwt.sign({ id: retailer._id }, process.env.JWT_SECRET as string);
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const retailerForgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, mobile } = req.body;
    
    // Validate if at least one field (email or mobile) is provided
    if (!email && !mobile) {
      res.status(400).json({ success: false, error: "Email or mobile number is required" });
      return;
    }

    let retailer;
    
    // Find retailer by email if provided
    if (email) {
      retailer = await Retailer.findOne({ email });
    }

    // If email is not provided, find by mobile if provided
    if (!retailer && mobile) {
      retailer = await Retailer.findOne({ mobile });
    }

    // If retailer not found, return error
    if (!retailer) {
      res.status(400).json({ success: false, error: "Retailer not found" });
      return;
    }

    // Generate OTP
    const otp = generateOTP();

    // Set OTP and expiry time
    retailer.authOtp = otp;
    retailer.authOtpExpiry = new Date(Date.now() + 600000); // OTP expires in 10 minutes

    // Save the OTP to the retailer record
    await Retailer.findByIdAndUpdate(retailer._id, { authOtp: otp, authOtpExpiry: retailer.authOtpExpiry });

    // Send OTP to retailer (via email or mobile)
    await sendOTP(retailer.mobile.toString(), otp.toString()); // Assuming email is used for sending OTP

    // Return success message
    res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRetailerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const retailer = await Retailer.findById(req.params.id).select("-authOtp -authOtpExpiry -password");
        res.status(200).json({ success: true, data: retailer });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


//update retailer by id with security so that password can not be changed
export const updateRetailerByIdWithSecurity = async (req: Request, res: Response): Promise<void> => {
    try {
        const retailer= await Retailer.findById(req.params.id);
        if (retailer) {
        const fieldsToRemove = ['password', 'mobile', 'authOtp', 'authOtpExpiry']

        // Remove sensitive fields from request body
        fieldsToRemove.forEach((field) => {
        if (req.body[field]) {
            delete req.body[field]
        }
        })
        const updatedRetailer = await Retailer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedRetailer });
        } else {
            res.status(400).json({ success: false, error: "Retailer not found" });
        }
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const updateRetailerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const retailer = await Retailer.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-authOtp -authOtpExpiry -password");
        res.status(200).json({ success: true, data: retailer });
    }
    catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}


export const retailerResetPasswordVerifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobile, otp } = req.body;
        if(!mobile) {
            res.status(400).json({success: false, error: "Mobile number is required" });
            return;
        }
        if(!otp) {
            res.status(400).json({success: false, error: "OTP is required" });
            return;
        }
        const retailer = await Retailer.findOne({ mobile });
        if (!retailer) {
            res.status(400).json({success: false, error: "Mobile number not found" });
            return;
        }
        if (retailer.authOtp !== otp) {
            res.status(400).json({success: false, error: "Invalid OTP" });
            return;
        }   
        if (!retailer.authOtpExpiry || new Date() > retailer.authOtpExpiry) {
            res.status(400).json({success: false, error: "OTP expired" });
            return;
        }
        await Retailer.findOneAndUpdate({ mobile }, { authOtp: otp, authOtpExpiry: new Date(Date.now() + 600000) }, { upsert: true })
        res.status(200).json({success: true, message: "OTP Verified successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const retailerResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, mobile, otp, password } = req.body

    // Validate that either email or mobile is provided
    if (!email && !mobile) {
      res.status(400).json({ success: false, error: 'Email or mobile number is required' });
      return;
    }

    // Validate that OTP and password are provided
    if (!otp) {
        res.status(400).json({ success: false, error: 'OTP is required' });
        return;
    }

    if (!password) {
        res.status(400).json({ success: false, error: 'Password is required' });
        return;
    }

    let retailer;

    // Look up the retailer by email or mobile
    if (email) {
      retailer = await Retailer.findOne({ email })
    }

    if (!retailer && mobile) {
      retailer = await Retailer.findOne({ mobile })
    }

    // Check if the retailer exists
    if (!retailer) {
        res.status(400).json({ success: false, error: 'Retailer not found' });
        return;
    }

    // Check if OTP is valid
    if (retailer.authOtp !== otp) {
        res.status(400).json({ success: false, error: 'Invalid OTP' });
        return;
    }

    // Check if OTP has expired
    if (!retailer.authOtpExpiry || new Date() > retailer.authOtpExpiry) {
        res.status(400).json({ success: false, error: 'OTP expired' });
        return;
    }

    // Save the updated password
      await retailer.save();

    // Respond with success message
    res.status(200).json({ success: true, message: 'Password reset successfully' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

// Set Location of the Retailer
export const setLocation = async (req: Request, res: Response): Promise<void> => {
    const { latitude, longitude } = req.body;
    const { id } = req.params;
  
    try {
      // Find the retailer by ID
      const retailer = await Retailer.findById(id);
      if (!retailer) {
        res.status(404).json({ message: 'Retailer not found' });
        return;
      }
  
      // Set the GeoJSON location
      retailer.address.location = {
        type: 'Point',
        coordinates: [longitude, latitude], // [longitude, latitude] format as per GeoJSON
      };
  
      // Save the updated retailer
      await retailer.save();
  
      res.status(200).json({ success: true, message: 'Location set successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// Get Nearby Retailers within a certain radius in kilometers
export const getNearbyRetailers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, radius } = req.query;
  
      // Ensure latitude, longitude, and radius are provided
      if (!latitude || !longitude || !radius) {
        res.status(400).json({ success: false, message: 'Latitude, longitude, and radius are required' });
        return;
      }
  
      // Convert latitude, longitude, and radius to numbers
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);
  
      if (isNaN(lat) || isNaN(lon) || isNaN(rad) || rad <= 0) {
        res.status(400).json({ success: false, message: 'Invalid latitude, longitude, or radius' });
        return;
      }
  
      // Convert radius to radians (Earth's radius is approximately 6378.1 km)
      const radiusInRadians = rad / 6378.1;
  
      // Query for retailers within the radius using GeoJSON
      const retailers = await Retailer.find({
        'address.location': {
          $geoWithin: {
            $centerSphere: [[lon, lat], radiusInRadians],
          },
        },
      });
  
      res.status(200).json({ success: true, retailers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  

