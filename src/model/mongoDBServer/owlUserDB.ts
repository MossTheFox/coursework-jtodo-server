import mongoose from "mongoose";

const connection = mongoose.createConnection(process.env.MONGO_URL_USER as string);

export default connection;