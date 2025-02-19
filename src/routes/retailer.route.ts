import { Router } from "express";
import * as RetailerControllers from "../controllers/retailer.controller";

const router: Router = Router();

router.post('/signupOtp', RetailerControllers.retailerMobileSignUpOTP);
router.post('/verifyNewRetailer', RetailerControllers.verifyRetailerMobileSignUpOTP);
router.post('/retailerSignup', RetailerControllers.retailerSignUp);
router.post('/retailerLogin', RetailerControllers.retailerLogin);
router.post('/retailerMobileLoginOtp', RetailerControllers.retailerMobileLoginOTP);
router.post('/retailerLoginOtpVerify', RetailerControllers.retailerOtpVerification);
router.post('/retailerForgotPassword', RetailerControllers.retailerForgotPassword);
router.post('/retailerResetPassword', RetailerControllers.retailerResetPassword);
router.post('/retailerResetPasswordVerifyOtp', RetailerControllers.retailerResetPasswordVerifyOtp);
router.get('/getRetailer/:id', RetailerControllers.getRetailerById);
router.put('/updateRetailer/:id', RetailerControllers.updateRetailerById);
router .post('/setRetailerStoreLocation/:id', RetailerControllers.setLocation);
// router.get('/getRetailerStoreLocation/:id', RetailerControllers.getLocation);
router.get('/getNearbyStores', RetailerControllers.getNearbyRetailers);





export default router;