import { Request, Response } from "express";
import Product from "../models/product";
import { ProductCategory } from "../../types/constants";
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import s3 from '../configs/awsConfig';
import "dotenv/config";

// Get All Products with Pagination and Filters for various fields
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract query parameters
        const { page = '1', limit = '10', category, minPrice, maxPrice, name, minRating, inStock } = req.query;
        
        // Ensure numeric parsing
        const pageNum: number = parseInt(page as string, 10) || 1;
    const limitNum: number = parseInt(limit as string, 10) || 10;
    
    // Create the filter object
    const filter: Record<string, any> = {};
    
    // Filter by category
    if (category && Object.values(ProductCategory).includes(category as ProductCategory)) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
        filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice as string, 10);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice as string, 10);
    }

    // Filter by name (case-insensitive)
    if (name) {
      filter.name = { $regex: name as string, $options: 'i' };
    }

    // Filter by minimum rating
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating as string) };
    }
    
    // Filter by stock availability
    if (inStock === 'true') {
      filter.stockQuantity = { $gt: 0 };
    }
    
    // Query the database with filters
    const products = await Product.find(filter)
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum);
    
    // Send the response
    res.status(200).json({sucess: true, products });
} catch (error: any) {
    // Send the error message
    res.status(500).json({success: false, message: error.message });
}
};


// Get a single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract the product ID
        const { id } = req.params;
        
    // Query the database for the product
    const product = await Product.findById(id);

    // If product is not found
    if (!product) {
      res.status(404).json({success: false, message: 'Product not found' });
      return;
    }

    // Send the product in response
    res.status(200).json({success: true, product });
  } catch (error: any) {
    // Send the error message
    res.status(500).json({ success: false, message: error.message });
  }
};


// Add a new product
export const addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract product details from the request body
      const { name, description, category, price, stockQuantity, retailerId } = req.body;

  
      // Extract the uploaded image URLs from the files
      const images = Array.isArray(req.files) ? req.files.map((file: any) => file.location) : [];
  
      // Check if images are uploaded
      if (images.length === 0) {
        res.status(400).json({success: false, message: 'At least one image is required' });
        return;
      }
  
      // Create a new product object
      const newProduct = new Product({
        name,
        description,
        category,
        price,
        stockQuantity,
        retailerId,
        images,
      });
  
      // Save the product to the database
      await newProduct.save();
  
      // Send a success response
      res.status(201).json({success: true, newProduct, message: 'Product added successfully', product: newProduct });
    } catch (error: any) {
      // Handle errors
      res.status(500).json({success: false, message: error.message });
    }
  };
  

// Update an existing product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stockQuantity, imagesToDelete } = req.body;
    const newImages = Array.isArray(req.files) ? req.files.map((file: any) => file.location) : [];

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Update fields if they are provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (stockQuantity) product.stockQuantity = stockQuantity;

    // Handle image deletions
    if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
      product.images = product.images.filter((image: string) => !imagesToDelete.includes(image));

      // Prepare keys for deletion from S3
      const objectsToDelete = imagesToDelete.map((image: string) => ({
        Key: image.split('/').pop() || ''
      }));

      const deleteParams = {
        Bucket: 'locovista', // Replace with your actual S3 bucket name
        Delete: {
          Objects: objectsToDelete
        }
      };

      // Delete images using DeleteObjectsCommand
      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      await s3.send(deleteCommand);
    }

    // Append new images
    if (newImages.length > 0) {
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Delete an existing product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the product ID
    const { id } = req.params;

    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(id);

    // If product is not found
    if (!deletedProduct) {
      res.status(404).json({success: false, message: 'Product not found' });
      return;
    }

    // Send the success response
    res.status(200).json({success: true, message: 'Product deleted successfully', product: deletedProduct });
  } catch (error: any) {
    // Send the error message
    res.status(500).json({success: false, message: error.message });
  }
};

// Get all reviews for a product
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the product ID
    const { id } = req.params;

    // Find the product by ID
    const product = await Product.findById(id);

    // If product is not found
    if (!product) {
      res.status(404).json({success: false, message: 'Product not found' });
      return;
    }

    // Send the reviews in response
    res.status(200).json({success: true, reviews: product.reviews });
  } catch (error: any) {
    // Send the error message
    res.status(500).json({success: false, message: error.message });
  }
};

// Add review to a product
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the product ID and review details from the request body
    const { id } = req.params;
    const { user, comment, rating } = req.body;

    // Find the product by ID
    const product = await Product.findById(id);

    // If product is not found
    if (!product) {
      res.status(404).json({success: false, message: 'Product not found' });
      return;
    }

    // Add the review to the product
    product.reviews.push({ user, comment, rating, createdAt: new Date() });
    product.rating = (product.rating + rating) / product.reviews.length;

    // Save the updated product
    await product.save();

    // Send the success response
    res.status(200).json({success: true, message: 'Review added successfully', product });
  } catch (error: any) {
    // Send the error message
    res.status(500).json({success: false, message: error.message });
  }
};

//Get Products by Retailer ID
export const getProductsByRetailerId = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the retailer ID
    const { id } = req.params;

    // Query the database for the products
    const products = await Product.find({ retailerId: id });

    // Send the products in response
    res.status(200).json({ products });
  } catch (error: any) {
    // Send the error message
    res.status(500).json({ message: error.message });
  }
};

// Get Retailer IDs by Product Name
export const getRetailerIdsByProductName = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the product name
    const { name } = req.params;

    // Query the database for the products
    const products = await Product.find({ name });

    // Extract the retailer IDs from the products
    const retailerIds = products.map((product) => product.retailerId);

    // Send the retailer IDs in response
    res.status(200).json({ retailerIds });
  } catch (error: any) {
    // Send the error message
    res.status(500).json({ message: error.message });
  }
};

// Compare products among different retailers
export const compareProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the product IDs
    const { ids } = req.body;

    // Query the database for the products
    const products = await Product.find({ _id: { $in: ids } });

    // Send the products in response
    res.status(200).json({ products });
  } catch (error: any) {
    // Send the error message
    res.status(500).json({ message: error.message });
  }
};


