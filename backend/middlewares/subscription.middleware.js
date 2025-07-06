import { body, param, query, validationResult } from 'express-validator';
import { CURRENCIES, CATEGORIES, PAYMENT_METHODS } from '../config/env.js';

// Validation for query parameters used in fetching subscriptions
export const validateSubscriptionQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be a positive integer between 1 and 100'),

    query('sortBy')
        .optional()
        .isIn(['startDate', 'renewalDate', 'createdAt', 'updatedAt', 'name', 'price'])
        .withMessage('Sort by must be one of: startDate, renewalDate, createdAt, updatedAt, name, price'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be either asc or desc'),

    query('name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name filter must be between 1 and 100 characters'),

    query('currency')
        .optional()
        .isIn(CURRENCIES)
        .withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),

    query('frequency')
        .optional()
        .isIn(['daily', 'weekly', 'monthly', 'yearly', 'one-time'])
        .withMessage('Frequency must be one of: daily, weekly, monthly, yearly, one-time'),

    query('category')
        .optional()
        .isIn(CATEGORIES)
        .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

    query('paymentMethod')
        .optional()
        .isIn(PAYMENT_METHODS)
        .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`),

    query('status')
        .optional()
        .isIn(['active', 'inactive', 'cancelled', 'expired'])
        .withMessage('Status must be one of: active, inactive, cancelled, expired'),

    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Invalid query parameters');
            error.statusCode = 400;
            error.data = errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }));
            return next(error);
        }
        next();
    }
];

export const validateCreateSubscription = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Subscription name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Subscription name must be between 2 and 100 characters'),

    body('price')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be greater than 0')
        .custom((value) => {
            // Validate decimal places (max 2 for currency)
            const decimalPlaces = (value.toString().split('.')[1] || '').length;
            if (decimalPlaces > 2) {
                throw new Error('Price cannot have more than 2 decimal places');
            }
            return true;
        }),

    body('currency')
        .optional()
        .isIn(CURRENCIES)
        .withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),

    body('frequency')
        .notEmpty()
        .withMessage('Frequency is required')
        .isIn(['daily', 'weekly', 'monthly', 'yearly', 'one-time'])
        .withMessage('Frequency must be one of: daily, weekly, monthly, yearly, one-time'),

    body('category')
        .optional()
        .isIn(CATEGORIES)
        .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

    body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(PAYMENT_METHODS)
        .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['active', 'inactive', 'cancelled', 'expired'])
        .withMessage('Status must be one of: active, inactive, cancelled, expired'),

    body('startDate')
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .withMessage('Start date must be a valid date')
        .custom((value) => {
            const startDate = new Date(value);
            const now = new Date();
            // Set time to start of day for fair comparison
            now.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            
            if (startDate > now) {
                throw new Error('Start date cannot be in the future');
            }
            return true;
        }),

    body('renewalDate')
        .optional()
        .isISO8601()
        .withMessage('Renewal date must be a valid date')
        .custom((value, { req }) => {
            if (!value) return true;
            
            const renewalDate = new Date(value);
            const startDate = new Date(req.body.startDate);
            const now = new Date();
            
            // Set time to start of day for fair comparison
            now.setHours(0, 0, 0, 0);
            renewalDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            
            if (renewalDate <= now) {
                throw new Error('Renewal date must be in the future');
            }
            
            if (renewalDate <= startDate) {
                throw new Error('Renewal date must be after start date');
            }
            
            return true;
        }),

    body('user')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('User ID must be a valid MongoDB ObjectId'),

    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 400;
            error.data = errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }));
            // Log detailed validation errors for debugging
            console.log('Validation errors:', error.data);
            return next(error);
        }
        next();
    }
];

// Validation for updating subscription
export const validateUpdateSubscription = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Subscription name must be between 2 and 100 characters'),

    body('price')
        .optional()
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be greater than 0')
        .custom((value) => {
            if (value !== undefined) {
                const decimalPlaces = (value.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    throw new Error('Price cannot have more than 2 decimal places');
                }
            }
            return true;
        }),

    body('currency')
        .optional()
        .isIn(CURRENCIES)
        .withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),

    body('frequency')
        .optional()
        .isIn(['daily', 'weekly', 'monthly', 'yearly', 'one-time'])
        .withMessage('Frequency must be one of: daily, weekly, monthly, yearly, one-time'),

    body('category')
        .optional()
        .isIn(CATEGORIES)
        .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

    body('paymentMethod')
        .optional()
        .isIn(PAYMENT_METHODS)
        .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'cancelled', 'expired'])
        .withMessage('Status must be one of: active, inactive, cancelled, expired'),

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),

    body('renewalDate')
        .optional()
        .isISO8601()
        .withMessage('Renewal date must be a valid date')
        .custom((value, { req }) => {
            if (!value) return true;
            
            const renewalDate = new Date(value);
            const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
            const now = new Date();
            
            now.setHours(0, 0, 0, 0);
            renewalDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            
            if (renewalDate <= now) {
                throw new Error('Renewal date must be in the future');
            }
            
            if (renewalDate <= startDate) {
                throw new Error('Renewal date must be after start date');
            }
            
            return true;
        }),

    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 400;
            error.data = errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }));
            return next(error);
        }
        next();
    }
];

// Validation for subscription ID parameters
export const validateSubscriptionId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid subscription ID format'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Invalid subscription ID');
            error.statusCode = 400;
            error.data = errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }));
            return next(error);
        }
        next();
    }
];

// Validation for user ID parameters
export const validateUserId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID format'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Invalid user ID');
            error.statusCode = 400;
            error.data = errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }));
            return next(error);
        }
        next();
    }
];