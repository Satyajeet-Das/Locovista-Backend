
import express, { Request, Response } from "express";
import Order from "../models/order";
import "dotenv/config";
import  { IOrder, IOrderItem,  }  from "../../types/model";



const router = express.Router();

/**
 * @route   POST /orders
 * @desc    Create a new order
 */
export const addOrder =  async (req: Request, res: Response) => {
  try {
    const orderData: IOrder = req.body;
    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order", error });
  }
};

/**
 * @route   GET /orders/:orderId
 * @desc    Get order details by order ID (populates product details)
 */
router.get("/orders/:orderId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("orderItems.product");
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch order", error });
  }
});

/**
 * @route   GET /orders/customer/:customerId
 * @desc    Get all orders for a customer by customer ID and extract products
 */
export const getOrdersbyCustomer =  async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    // Find orders for the customer and populate the product details in order items
    const orders = await Order.find({ user: customerId }).populate("orderItems.product");
    if (!orders || orders.length === 0) {
      res.status(404).json({ message: "No orders found for this customer" });
      return;
    }

    // Extract products from all orders
    const products = orders.reduce((acc: any[], order) => {
      order.orderItems.forEach((item) => {
        // Avoid duplicate products by checking if the product is already in the list
        if (!acc.find((p) => p._id.toString() === item.product._id.toString())) {
          acc.push(item.product);
        }
      });
      return acc;
    }, []);

    res.json({ orders, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

/**
 * @route   PUT /orders/:orderId
 * @desc    Update an existing order
 */
router.put("/orders/:orderId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
    if (!updatedOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order", error });
  }
});

/**
 * @route   DELETE /orders/:orderId
 * @desc    Delete an order by ID
 */
router.delete("/orders/:orderId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order", error });
  }
});

export default router;


