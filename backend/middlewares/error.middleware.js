const errorMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };

        error.message = err.message;

        console.error(err);

        // Default error
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = 'Internal Server Error';
        }

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            error.statusCode = 400;
            error.message = message;
        }

        // Mongoose duplicate key error
        if (err.code === 11000) {
            const message = 'Duplicate field value entered';
            error.statusCode = 400;
            error.message = message;
        }

        // Mongoose cast error
        if (err.name === 'CastError') {
            const message = 'Resource not found';
            error.statusCode = 404;
            error.message = message;
        }

        res.status(error.statusCode).json({
            success: false,
            error: error.message
        });
    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;