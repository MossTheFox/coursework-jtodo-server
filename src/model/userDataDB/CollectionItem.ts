import mongoose from "mongoose";
import mainDB from "../mongoDBServer/dbConnection";

// use UUID (generated by client) to identify a specific one
interface CollectionItemInterface {
    uuid: string;
    inCollection: string;   // collection UUID (assotiated with user)
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;    // pending, may not be in use
    deadLine?: Date;
    checked: boolean;
    checkedAt: Date;    // pending
}

const CollectionItem = mainDB.model<CollectionItemInterface>("collectionItem", new mongoose.Schema<CollectionItemInterface>({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: new mongoose.Types.ObjectId().toHexString()
    },
    inCollection: {
        type: String,
        required: true,
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
    updatedAt: {
        type: Date,
        required: true,
        default: new Date()
    },
    deadLine: {
        type: Date,
        required: false,
        default: null
    },
    checked: {
        type: Boolean,
        required: true,
        default: false
    },
    checkedAt: {
        type: Date,
        required: true,
        default: new Date()
    }
}));

export default CollectionItem;