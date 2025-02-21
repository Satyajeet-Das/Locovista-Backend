import { Router } from "express";
import * as AddressRoute from "../controllers/address.controller";

const router: Router = Router();
router.post('/addAddress', AddressRoute.addAddress);
router.get('/showOtherLocation', AddressRoute.showOtherLocation);
router.get('/getAllAddresses', AddressRoute.getAllAddresses);
router.get('/getAddress/:id', AddressRoute.getAddressById);
router.put('/updateAddress/:id', AddressRoute.updateAddress);
router.delete('/deleteAddress/:id', AddressRoute.deleteAddress);

export default Router;