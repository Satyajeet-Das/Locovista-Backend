import { Request, Response } from 'express'
import Services from '../models/services'
import Review from '../models/review'
import 'dotenv/config'

//create the service in the schema taking all input for the services
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, duration, category,rating, retailerId } = req.body
    const service = new Services({
      name,
      description,
      price,
      duration,
      rating,
      category,
      retailerId,
    })
    await service.save()
    res.status(201).json({ message: 'Service created successfully', service })
  } catch (error) {
    throw error
  }
}
// Get All Products with Pagination and Filters for various fields like price and category minPrice and max Price and name and rating
export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', category, minPrice, maxPrice, name, rating } = req.query
    const query: any = {
      ...(category && { category }),
      ...(name && { name: { $regex: name, $options: 'i' } }),
      ...(rating && { rating }),
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: minPrice }
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: maxPrice }
    }
    const services = await Services.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec()
    const count = await Services.countDocuments(query)
    res.status(200).json({ services, totalPages: Math.ceil(count / Number(limit)), currentPage: Number(page) })
  } catch (error) {
    throw error;
  }
}
// Get Service by Id
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Services.findById(req.params.id)
    res.status(200).json({ service })
  } catch (error) {
    throw error
  }
}
// Update Service by Id
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, duration, category, rating } = req.body
    const updateFields: any = {}
    if (name) updateFields.name = name
    if (description) updateFields.description = description
    if (price) updateFields.price = price
    if (duration) updateFields.duration = duration
    if (category) updateFields.category = category
    if (rating) updateFields.rating = rating

    const service = await Services.findByIdAndUpdate(req.params.id, updateFields, { new: true })
    res.status(200).json({ message: 'Service updated successfully', service })
  } catch (error) {
    throw error
  }
}
// Delete Service by Id
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Services.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Service deleted successfully', service })
  } catch (error) {
    throw error
  }
}
// Get All Reviews for a Service
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ serviceId: req.params.id })
    res.status(200).json({ reviews })
  } catch (error) {
    throw error
  }
}
// add a review for a service from customer id to service id and retailer id
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, serviceId, retailerId, rating, review } = req.body
    const newReview = new Review({
      user: customerId,
      serviceId,
      retailerId,
      comment: review,
      rating,
    })
    await newReview.save()
    res.status(201).json({ message: 'Review added successfully', newReview })
  } catch (error) {
    throw error
  }
}

// Get All Services by Retailer Id
export const getServicesByRetailerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Services.find({ retailerId: req.params.id })
    res.status(200).json({ services })
  } catch (error) {
    throw error
  }
}

