import { body, param, validationResult } from 'express-validator';

// Validation for updating user profile
export const validateUpdateProfile = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Name must be between 3 and 30 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

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
