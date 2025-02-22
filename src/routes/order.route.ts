import { Router } from "express";
import * as OrderControllers from "../controllers/order.controller";

const router: Router = Router();

router.get("/order/customer/:customerId", OrderControllers.getOrdersbyCustomer);
router.post("/order", OrderControllers.addOrder);

export default router;
