import mongoose from "mongoose";

const todoListDB = mongoose.createConnection(process.env.MONGODB_URI_TODOLIST!);

export default todoListDB;