import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRATION } from "../config/env.js";

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email }).session(session);

        if (existingUser) {
            const error = new Error("User already exists with this email");
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await User.create([{ name, email, password: hashedPassword }], { session });

        const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        await session.commitTransaction();
        res.status(201).json({ 
            success: true,
            message: "User signed up successfully",
            data: {
                token,
                user: {
                    id: newUser[0]._id,
                    name: newUser[0].name,
                    email: newUser[0].email
                }
            }
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const signIn = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).session(session);

        if (!user) {
            const error = new Error("User not found with this email");
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error("Invalid password");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const resetPassword = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.user) {
            const error = new Error("Unauthorized access! You must be signed in to reset your password.");
            error.statusCode = 401;
            throw error;
        }

        if (req.user.role === 'admin') {
            const error = new Error("Admin users cannot reset passwords.");
            error.statusCode = 403;
            throw error;
        }

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            const error = new Error("Both old and new passwords are required.");
            error.statusCode = 400;
            throw error;
        }

        if (oldPassword === newPassword) {
            const error = new Error("New password must be different from old password.");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(req.user._id).session(session);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            const error = new Error("Old password is incorrect");
            error.statusCode = 401;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);
        user.password = hashedNewPassword;

        await user.save({ session });
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};