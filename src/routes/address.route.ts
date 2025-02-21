import { Router } from "express";
import * as AddressControllers from "../controllers/address.controller";

const router: Router = Router();

router.get('/address', AddressControllers.getAllAddresses);
router.get('/address/:id', AddressControllers.getAddressById);
router.post('/address', AddressControllers.addAddress);
router.put('/address/:id', AddressControllers.updateAddress);
router.delete('/address/:id', AddressControllers.deleteAddress);

export default router;