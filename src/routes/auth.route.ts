import { Router } from "express";
import * as AuthControllers from "../controllers/auth.controller";

const router: Router = Router();

router.post('/signupOtp', AuthControllers.customerMobileSignUpOTP);
router.post('/verifyNewCustomer', AuthControllers.verifyCustomerMobileSignUpOTP);
router.post('/customerSignup', AuthControllers.customerSignUp);
router.post('/customerLogin', AuthControllers.customerLogin);
router.post('/customerLoginWithOtp', AuthControllers.customerLoginWithOTP);
router.post('/customerForgotPassword', AuthControllers.customerForgotPassword);
router.post('/getCustomerById', AuthControllers.getCustomerById);
router.post('/updateCustomerById', AuthControllers.updateCustomerById);
router.post('/customerResetPassword', AuthControllers.customerResetPassword);



export default router;