import mongoose from "mongoose";
import { CURRENCIES, CATEGORIES, PAYMENT_METHODS } from "../config/env.js";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Subscription Name is required"],
        trim: true,
        minlength: [2, "Subscription Name must be at least 2 characters long"],
        maxlength: [100, "Subscription Name must be at most 100 characters long"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"]
    },
    currency: {
        type: String,
        enum: {
            values: CURRENCIES,
            message: "{VALUE} is not a valid currency"
        },
        default: 'USD'
    },
    frequency: {
        type: String,
        required: [true, "Frequency is required"],
        enum: {
            values: ['daily', 'weekly', 'monthly', 'yearly', 'one-time'],
            message: "{VALUE} is not a valid frequency"
        },
    },
    category: {
        type: String,
        enum: {
            values: CATEGORIES,
            message: "{VALUE} is not a valid category"
        },
        default: 'Other'
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment Method is required"],
        enum: {
            values: PAYMENT_METHODS,
            message: "{VALUE} is not a valid payment method"
        },
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: {
            values: ['active', 'inactive', 'cancelled', 'expired'],
            message: "{VALUE} is not a valid status"
        },
    },
    startDate: {
        type: Date,
        required: [true, "Start Date is required"],
        validate: {
            validator: (value) => value <= new Date(),
            message: "Start Date cannot be in the future"
        },
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return value > new Date() && value > this.startDate;
            },
            message: "Renewal Date must be in the future and after Start Date",
        },
        default: function() {
            if (!this.startDate || !this.frequency || this.frequency === 'one-time') {
                return undefined;
            }

            const renewalDate = new Date(this.startDate);
            
            switch(this.frequency) {
                case 'daily':
                    renewalDate.setDate(renewalDate.getDate() + 1);
                    break;
                case 'weekly':
                    renewalDate.setDate(renewalDate.getDate() + 7);
                    break;
                case 'monthly':
                    renewalDate.setMonth(renewalDate.getMonth() + 1);
                    break;
                case 'yearly':
                    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                    break;
                default:
                    return undefined;
            }
            
            return renewalDate;
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        validate: {
            validator: async function(value) {
                const userExists = await mongoose.models.User.exists({ _id: value });
                return userExists;
            },
            message: "User does not exist"
        },
        index: true
    },
}, { timestamps: true });

subscriptionSchema.pre('save', function(next) {
    const now = new Date();
    if (this.renewalDate && this.renewalDate < now) {
        this.status = 'expired';
    } else if (this.status === 'active' && this.renewalDate && this.renewalDate > now) {
        this.status = 'active';
    }
    next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;