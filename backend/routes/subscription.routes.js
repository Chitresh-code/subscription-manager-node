import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { 
    createSubscription,
    getAllSubscriptions,
    getUserSubscriptions,
    getSubscriptionsByUserId
} from '../controllers/subscription.controller.js';
import { 
    validateCreateSubscription, 
    validateUpdateSubscription, 
    validateSubscriptionId, 
    validateUserId,
    validateSubscriptionQuery
} from '../middlewares/subscription.middleware.js';

const subscriptionRouter = Router();

// Create subscription
subscriptionRouter.post('/', authorize, validateCreateSubscription, createSubscription);

// Get all subscriptions (Admin only) - with filtering and sorting
subscriptionRouter.get('/', authorize, validateSubscriptionQuery, getAllSubscriptions);

// Get current user's subscriptions - with filtering and sorting
// subscriptionRouter.get('/my-subscriptions', authorize, validateSubscriptionQuery, getUserSubscriptions);

// Get subscriptions for a specific user - with filtering and sorting
subscriptionRouter.get('/user/:id', authorize, validateUserId, validateSubscriptionQuery, getSubscriptionsByUserId);

// Get upcoming renewals
subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({ title: 'GET upcoming renewals' }));

// Get subscription details
subscriptionRouter.get('/:id', validateSubscriptionId, (req, res) => res.send({ title: 'GET subscription details'}));

// Update subscription
subscriptionRouter.put('/:id', validateSubscriptionId, validateUpdateSubscription, (req, res) => res.send({ title: 'UPDATE subscription' }));

// Cancel subscription
subscriptionRouter.put('/:id/cancel', validateSubscriptionId, (req, res) => res.send({ title: 'CANCEL subscription' }));

// Delete subscription
subscriptionRouter.delete('/:id', validateSubscriptionId, (req, res) => res.send({ title: 'DELETE subscription' }));

export default subscriptionRouter;