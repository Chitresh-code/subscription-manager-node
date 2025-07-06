import aj from '../config/arcjet.js';

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const resetTimeSeconds = Math.ceil((decision.reason.resetTime - Date.now()) / 1000);
                return res.status(429).json({
                    success: false,
                    message: "Rate limit exceeded. Please try again later.",
                    error: `Too many requests! Limit reset in ${resetTimeSeconds} seconds`
                });
            }

            if (decision.reason.isBot()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied for bots.",
                    error: `Bot access denied: ${decision.reason.botType}`
                });
            }

            console.warn(`Arcjet protection denied request: ${decision.reason}`);
            return res.status(403).json({
                success: false,
                message: "Access denied.",
                error: `Access denied: ${decision.reason}`
            });
        }

        next();
    } catch (error) {
        console.error(`Arcjet middleware error: ${error}`);
        next(error);
    }
};

export default arcjetMiddleware;