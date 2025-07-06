import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/env.js';
import bcrypt from 'bcryptjs';

const createAdminUser = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingAdmin = await User.findOne({ role: 'admin', email: ADMIN_EMAIL }).session(session);
        if (existingAdmin) {
            console.log(`Admin user with email ${ADMIN_EMAIL} already exists. Skipping creation.`);
            await session.commitTransaction();
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
        const adminUser = new User({
            name: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });
        await adminUser.save({ session });
        console.log(`Admin user created with email: ${ADMIN_EMAIL}`);
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating admin user:", error);
    } finally {
        session.endSession();
    }
}

export default createAdminUser;