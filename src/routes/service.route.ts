import { Router } from "express";
import * as ServiceControllers from "../controllers/service.controller";

const router: Router = Router();

router.post('/createService', ServiceControllers.createService);
router.get('/getAllServices', ServiceControllers.getAllServices);
router.get('/getServiceById/:id', ServiceControllers.getServiceById);
router.put('/updateService/:id', ServiceControllers.updateService);
router.delete('/deleteService/:id', ServiceControllers.deleteService);
router.get('/getAllReviews/:id', ServiceControllers.getAllReviews);
router.post('/addReview', ServiceControllers.addReview);
router.get('/getServicesByRetailer/:id', ServiceControllers.getServicesByRetailerId);


export default router;