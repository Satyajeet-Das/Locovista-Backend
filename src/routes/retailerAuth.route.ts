import { Router } from "express";
import * as RetailerAuthControllers from "../controllers/retailerAuth.controller";

const router: Router = Router();

router.post('/signupOtp', RetailerAuthControllers.retailerMobileSignUpOTP);
router.post('/verifyNewRetailer', RetailerAuthControllers.verifyRetailerMobileSignUpOTP);
router.post('/retailerSignup', RetailerAuthControllers.retailerSignUp);
router.post('/retailerLogin', RetailerAuthControllers.retailerLogin);
router.post('/retailerMobileLoginOtp', RetailerAuthControllers.retailerMobileLoginOTP);
router.post('/retailerLoginOtpVerify', RetailerAuthControllers.retailerOtpVerification);
router.post('/retailerForgotPassword', RetailerAuthControllers.retailerForgotPassword);
router.post('/retailerResetPassword', RetailerAuthControllers.retailerResetPassword);
router.post('/retailerResetPasswordVerifyOtp', RetailerAuthControllers.retailerResetPasswordVerifyOtp);
router.get('/getRetailer/:id', RetailerAuthControllers.getRetailerById);
router.put('/updateRetailer/:id', RetailerAuthControllers.updateRetailerById);





export default router;