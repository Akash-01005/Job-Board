import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Job-Board';
        await mongoose.connect(mongoURI);
        console.log("Database connected successfully...");
    } catch (error) {
        console.log("Database connection failed...");
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;