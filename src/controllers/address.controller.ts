import { Request, Response } from "express";
import Address from "../models/address";
import Customer from "../models/customer";
import Retailer from "../models/retailer";
import retailer from "../models/retailer";

// Create a new customer address through cutsomer id and it into current location
export const addAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.query;
    const { address } = req.body
    const newAddress = new Address({
      address
    })
        await newAddress.save()
        newAddress._id;
        const customer = await Customer.findByIdAndUpdate(
            customerId,
            { $set: { currentLocation: newAddress._id }, $push: { address: newAddress._id } },
            { new: true }
        );
        if (!customer) {
            res.status(400).json({ success: false, message: 'Customer not found' });
            return;
        }
        await customer.save();  
    res.status(201).json({ success: true, message: 'Address added successfully', address: newAddress })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

//show other location instead of current location by customer id
export const showOtherLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.query;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            res.status(400).json({ success: false, message: 'Customer not found' });
            return;
        }
        const addresses = await Address.find({ _id: { $in: customer.address } });
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Get all addresses of a customer
export const getAllAddresses = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.query;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            res.status(400).json({ success: false, message: 'Customer not found' });
            return;
        }
        const addresses = await Address.find({ _id: { $in: customer.address } });
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Get address by id
export const getAddressById = async (req: Request, res: Response): Promise<void> => {
    try {
        const address = await Address.findById(req.params.id);
        res.status(200).json({ success: true, address });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}   

// Update address by id
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const address = await Address.findByIdAndUpdate(req.params.id, req.body
            , { new: true });
        res.status(200).json({ success: true, message: 'Address updated successfully', address });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Delete address by id
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const address = await Address.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Address deleted successfully', address });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//replace current location with other location by customer id
export const replaceCurrentLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.query;
        const { addressId } = req.body;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            res.status(400).json({ success: false, message: 'Customer not found' });
            return;
        }
        const address = await Address.findById(addressId);
        if (!address) {
            res.status(400).json({ success: false, message: 'Address not found' });
            return;
        }
        customer.currentLocation = addressId;
        await customer.save();
        res.status(200).json({ success: true, message: 'Current location updated successfully', address });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Get current location of a customer
export const getCurrentLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.query;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            res.status(400).json({ success: false, message: 'Customer not found' });
            return;
        }
        const address = await Address.findById(customer.currentLocation);
        res.status(200).json({ success: true, address });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//get nearby retailer with service type and bussiness type and also product type and service name  by customer id current location
export const getNearbyRetailers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId,productName,bussinessType,serviceName} = req.query;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            res.status(400).json({ success: false, message: 'Customer not found' });
            return;
        }
        const address = await Address.findById(customer.currentLocation);
        if (!address) {
            res.status(400).json({ success: false, message: 'Address not found' });
            return;
        }
        const lat = parseFloat(address.lat as string);
        const lon = parseFloat(address.lon as string);
        const rad = parseFloat(req.query.rad as string);
        if (isNaN(lat) || isNaN(lon) || isNaN(rad) || rad <= 0) {
            res.status(400).json({ success: false, message: 'Invalid parameters' });
            return;
        }
        const radiusInRadians = rad / 6371.1;

        let retailers = await Retailer.find({
            'address.location': {
            $geoWithin: {
                $centerSphere: [[lon, lat], radiusInRadians],
            },
            }
        }).populate('products').populate('services');
        if (!retailer) {
            res.status(400).json({ success: false, message: 'Retailer not found' });
            return;
        }
        if (bussinessType) {
            retailers = retailers.filter(retailer => retailer.business_type.includes(bussinessType));
        }
        if (productName) {
            retailers = retailers.filter(retailer => retailer.products.some((product: any) => product.name === productName));
        }
        if (serviceName) { 
            retailers = retailers.filter(retailer => retailer.services.some((service: any) => service.name === serviceName));
        }
        res.status(200).json({ success: true, retailers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

}

