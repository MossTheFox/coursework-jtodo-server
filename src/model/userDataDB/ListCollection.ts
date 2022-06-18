import mongoose from "mongoose";
import mainDB from "../mongoDBServer/dbConnection";

// use UUID to identify a specific one
interface CollectionInterface {
    uuid: string;
    name: string;
    description: string;
    createdAt: Date;
    owner: string;  // qqUnionID
}

export const ListCollection = mainDB.model<CollectionInterface>("listCollection", new mongoose.Schema<CollectionInterface>({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: new mongoose.Types.ObjectId().toHexString()
    },
    name: {
        type: String,
        required: true,
        default: "untitled"
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    },
    owner: {
        type: String,
        required: true
    }
}));


