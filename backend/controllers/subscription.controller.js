import mongoose from 'mongoose';
import Subscription from '../models/subscription.model.js';
import User from '../models/user.model.js';

// Helper function to build filter object
const buildFilterObject = (query, userId = null) => {
    const filter = {};
    
    // If userId is provided, filter by user
    if (userId) {
        filter.user = userId;
    }
    
    // Name filter (case-insensitive partial match)
    if (query.name) {
        filter.name = { $regex: query.name, $options: 'i' };
    }
    
    // Currency filter
    if (query.currency) {
        filter.currency = query.currency;
    }
    
    // Frequency filter
    if (query.frequency) {
        filter.frequency = query.frequency;
    }
    
    // Category filter
    if (query.category) {
        filter.category = query.category;
    }
    
    // Payment method filter
    if (query.paymentMethod) {
        filter.paymentMethod = query.paymentMethod;
    }
    
    // Status filter
    if (query.status) {
        filter.status = query.status;
    }
    
    return filter;
};

// Helper function to build sort object
const buildSortObject = (sortBy, sortOrder) => {
    const sort = {};
    
    // Default sorting
    if (!sortBy || !['startDate', 'renewalDate', 'createdAt', 'updatedAt', 'name', 'price'].includes(sortBy)) {
        sort.createdAt = -1; // Default: newest first
        return sort;
    }
    
    // Validate sort order
    const order = sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = order;
    
    return sort;
};

// Get all subscriptions (Admin only)
export const getAllSubscriptions = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            const error = new Error('Access denied. Admin privileges required.');
            error.statusCode = 403;
            throw error;
        }

        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            name,
            currency,
            frequency,
            category,
            paymentMethod,
            status
        } = req.query;

        // Build filter object
        const filter = buildFilterObject(req.query);
        
        // Build sort object
        const sort = buildSortObject(sortBy, sortOrder);
        
        // Convert pagination parameters
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
        const skip = (pageNumber - 1) * pageSize;

        // Execute query with pagination
        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter)
                .populate('user', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .lean(),
            Subscription.countDocuments(filter)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / pageSize);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        res.status(200).json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: pageSize,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    name,
                    currency,
                    frequency,
                    category,
                    paymentMethod,
                    status
                },
                sort: {
                    sortBy,
                    sortOrder
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get current user's subscriptions
export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            throw error;
        }

        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            name,
            currency,
            frequency,
            category,
            paymentMethod,
            status
        } = req.query;

        // Build filter object with user ID
        const filter = buildFilterObject(req.query, req.user._id);
        
        // Build sort object
        const sort = buildSortObject(sortBy, sortOrder);
        
        // Convert pagination parameters
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
        const skip = (pageNumber - 1) * pageSize;

        // Execute query with pagination
        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .lean(),
            Subscription.countDocuments(filter)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / pageSize);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        res.status(200).json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: pageSize,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    name,
                    currency,
                    frequency,
                    category,
                    paymentMethod,
                    status
                },
                sort: {
                    sortBy,
                    sortOrder
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get subscriptions for a specific user (Admin only)
export const getSubscriptionsByUserId = async (req, res, next) => {
    try {
        if (!req.user && req.user._id !== req.body.user) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            throw error;
        }

        const { id: userId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            name,
            currency,
            frequency,
            category,
            paymentMethod,
            status
        } = req.query;

        // Verify user exists
        const user = await User.findById(userId).select('name email');
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Build filter object with user ID
        const filter = buildFilterObject(req.query, userId);
        
        // Build sort object
        const sort = buildSortObject(sortBy, sortOrder);
        
        // Convert pagination parameters
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
        const skip = (pageNumber - 1) * pageSize;

        // Execute query with pagination
        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .lean(),
            Subscription.countDocuments(filter)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / pageSize);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                subscriptions,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: pageSize,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    name,
                    currency,
                    frequency,
                    category,
                    paymentMethod,
                    status
                },
                sort: {
                    sortBy,
                    sortOrder
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const createSubscription = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.user) {
            const error = new Error("Authentication required");
            error.statusCode = 401;
            throw error;
        }

        if (req.user.role === 'admin' && req.user._id.toString() !== req.body.user) {
            const error = new Error("You are not allowed to create subscriptions at this time. Please contact support for assistance.");
            error.statusCode = 403;
            throw error;
        }

        if (!req.body.name || !req.body.price || !req.body.frequency || !req.body.paymentMethod || !req.body.status || !req.body.startDate) {
            const error = new Error("Required fields are missing. Please provide name, price, frequency, payment method, status, and start date.");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(req.user._id).session(session);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const subscription = new Subscription({
            ...req.body,
            user: user._id
        });

        await subscription.save({ session });
        await session.commitTransaction();
        res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            subscription
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
}

