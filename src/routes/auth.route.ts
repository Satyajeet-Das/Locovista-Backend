import { Router } from "express";
import * as AuthControllers from "../controllers/auth.controller";

const router: Router = Router();

router.post('/signupOtp', AuthControllers.customerMobileSignUpOTP);
router.post('/verifyNewCustomer', AuthControllers.verifyCustomerMobileSignUpOTP);
router.post('/customerSignup', AuthControllers.customerSignUp);
router.post('/customerLogin', AuthControllers.customerLogin);
router.post('/customerMobileLoginOtp', AuthControllers.customerMobileLoginOTP);
router.post('/customerLoginOtpVerify', AuthControllers.LoginOtpVerification);
router.post('/customerForgotPassword', AuthControllers.customerForgotPassword);
router.post('/customerResetPasswordVerifyOtp', AuthControllers.customerResetPasswordVerifyOtp);
router.get('/getCustomer/:id', AuthControllers.getCustomerById);
router.put('/updateCustomer/:id', AuthControllers.updateCustomerById);
router.post('/customerResetPassword', AuthControllers.customerResetPassword);



export default router;