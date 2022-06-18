import mongoose from "mongoose";
import mainDB from "../mongoDBServer/dbConnection";
import jsonwebtoken from "jsonwebtoken";

export interface AccountInterface {
    qqUnionID: string;      // 唯一标识
    username: string;
    avatarUrl: string;      // 完成 QQ OAuth 之后存储
    registeredAt: Date;
};

const AccountCore = mainDB.model<AccountInterface>("account", new mongoose.Schema<AccountInterface>({
    qqUnionID: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        default: "User",
    },
    avatarUrl: {
        type: String,
        default: "https://app.mxowl.com/pwa-assets/manifest-icon-192.maskable.png",
    },
    registeredAt: {
        type: Date,
        default: new Date()
    },
}));

export default AccountCore;

export function createToken(qqUnionID: string): string {
    return jsonwebtoken.sign({
        qqUnionID: qqUnionID
    }, process.env.JWT_SECRET!, {
        expiresIn: "30d"
    });
}

export function verifyToken(token: string): string {
    let decoded: any;
    try {
        decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
        console.log(err);
        throw new Error("Token is invalid");
    }
    return decoded.qqUnionID;
}