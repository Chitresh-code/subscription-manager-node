import mongoose from 'mongoose';
import User from '../models/user.model.js';

export const getUsers = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (req.user.role !== 'admin') {
            const error = new Error(`Unauthorized access! User with role ${req.user.role} cannot access this resource.`);
            error.statusCode = 403;
            throw error;
        }

        const users = await User.find({}, '-password').session(session);

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const getUserbyId = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            const error = new Error(`Unauthorized access! Only admin or the user themselves can access their own data.`);
            error.statusCode = 403;
            throw error;
        }

        const userId = req.params.id;
        const user = await User.findById(userId, '-password').session(session);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const updateUserDetails = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.params.id;

        if (req.user._id.toString() !== userId) {
            const error = new Error("Unauthorized access! You can only update your own details.");
            error.statusCode = 403;
            throw error;
        }
        
        if ('email' in req.body) {
            const error = new Error("Email cannot be updated!");
            error.statusCode = 400;
            throw error;
        }

        const { name } = req.body;
        const updatedUser = await User.findById(userId, '-password').session(session);
        if (!updatedUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (updatedUser.role === 'admin') {
            const error = new Error("Admin accounts cannot be updated");
            error.statusCode = 403;
            throw error;
        }

        updatedUser.name = name;
        await updatedUser.save({ session });

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "User details updated successfully",
            data: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email
            }
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const deleteUserAccount = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.params.id;

        if (req.user._id.toString() !== userId) {
            const error = new Error("Unauthorized access! You can only delete your own account.");
            error.statusCode = 403;
            throw error;
        }

        const user = await User.findById(userId).session(session);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (user.role === 'admin') {
            const error = new Error("Admin accounts cannot be deleted");
            error.statusCode = 403;
            throw error;
        }

        await User.findByIdAndDelete(userId).session(session);
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "User account deleted successfully"
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};