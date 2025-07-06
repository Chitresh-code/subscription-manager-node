import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User Name is required"],
        trim: true,
        minlength: [3, "User Name must be at least 3 characters long"],
        maxlength: [30, "User Name must be at most 30 characters long"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        maxlength: [128, "Password must be at most 128 characters long"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;