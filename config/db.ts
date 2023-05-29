import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB connected ${connect.connection.host}`);
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error: ${error.message}`);
            process.exit(1);
        }
    }
}

export { connectDB };