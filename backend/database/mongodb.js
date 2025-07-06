import mongoose from "mongoose";
import { DB_URI, NODE_ENV, DB_NAME } from "../config/env.js";
import createAdminUser from "../utils/createAdminUser.js";

if(!DB_URI) {
    throw new Error("Database URI is not defined. Please check your environment variables.");
}

const connectToDatabase = async () => {
    try {
        const databaseName = NODE_ENV === 'prod'
        ? `${DB_NAME}_prod` :
        NODE_ENV === 'dev' ? `${DB_NAME}_dev` :
        `${DB_NAME}_test`;

        await mongoose.connect(DB_URI, {
            dbName: databaseName,
        });

        console.log(`Connected to MongoDB database: ${databaseName} successfully in ${NODE_ENV} mode!`);
        await createAdminUser();
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
}

export default connectToDatabase;