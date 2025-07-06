import { config } from 'dotenv';

config ({ path: `.env.${process.env.NODE_ENV || 'dev'}.local` });

export const { 
    PORT, 
    NODE_ENV, 
    DB_URI, DB_NAME,
    SUBSCRIPTION_CURRENCIES, SUBSCRIPTION_CATEGORIES, SUBSCRIPTION_PAYMENT_METHODS,
    JWT_SECRET, JWT_EXPIRATION,
    ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD,
    ARCJET_KEY,
} = process.env;

export const CURRENCIES = SUBSCRIPTION_CURRENCIES 
    ? SUBSCRIPTION_CURRENCIES.split(',').map(currency => currency.trim())
    : ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CNY']; // Default fallback

export const CATEGORIES = SUBSCRIPTION_CATEGORIES
    ? SUBSCRIPTION_CATEGORIES.split(',').map(category => category.trim())
    : ['Entertainment', 'Utilities', 'Food', 'Health', 'Education', 'Travel', 'Other']; // Default fallback

export const PAYMENT_METHODS = SUBSCRIPTION_PAYMENT_METHODS
    ? SUBSCRIPTION_PAYMENT_METHODS.split(',').map(method => method.trim())
    : ['Credit Card', 'Debit Card', 'PayPal', 'Direct Debit', 'Crypto', 'UPI']; // Default fallback