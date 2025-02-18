import { Router } from "express";
import * as ProductControllers from "../controllers/product.controller";
import upload  from "../configs/multerConfig";

const router: Router = Router();

router.get('/product', ProductControllers.getAllProducts);
router.get('/product/:id', ProductControllers.getProductById);
router.post('/product', upload.array('images',10), ProductControllers.addProduct);
router.put('/product/:id',upload.array('images', 10), ProductControllers.updateProduct);
router.delete('/product/:id', ProductControllers.deleteProduct);
router.post('/product/:id/review', ProductControllers.addReview);
router.get('/product/:id/review', ProductControllers.getAllReviews);
router.get('/product/:name/retailer', ProductControllers.getRetailerIdsByProductName);
router.post('/product/compare', ProductControllers.compareProducts);

export default router;