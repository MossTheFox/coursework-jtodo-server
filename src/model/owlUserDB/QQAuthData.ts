import { Schema } from "mongoose";
import owlUserDB from "../mongoDBServer/owlUserDB";

export interface QQAuthDataInterface {
    date: Date;
    available: boolean;
    rawAccessTokenResponse?: any;
    rawOpenIDResponse?: any;
    rawGetUserInfoResponse?: any;
    rawRefreshTokenResponse?: any;
    authorizationCode?: string;
    accessToken?: string;
    refreshToken?: string;
    openID?: string;
    unionID?: string;
    userInfo?: {
        nickname?: string;
        figureURL?: string
    };
    payload?: any;
}

export const QQAuthData = owlUserDB.model<QQAuthDataInterface>("qqAuthData", new Schema<QQAuthDataInterface>({
    // 用 object id 做为唯一标识
    date: {
        required: true,
        type: Date,
        default: new Date()
    },
    available: {        // ← 保证每次验证凭证只可以被使用一次
        required: true,
        type: Boolean,
        default: false
    },
    rawAccessTokenResponse: {
        type: Schema.Types.Mixed
    },
    rawOpenIDResponse: {
        type: Schema.Types.Mixed
    },
    rawGetUserInfoResponse: {
        type: Schema.Types.Mixed
    },
    rawRefreshTokenResponse: {
        type: Schema.Types.Mixed
    },
    authorizationCode: String,
    accessToken: String,
    refreshToken: String,
    openID: String,
    unionID: String,
    userInfo: {
        // 出于尊重考虑，不记录性别
        nickname: String,
        figureURL: String   // 取获取到的最大的头像链接来存储
    },
    payload: {
        type: Schema.Types.Mixed
    }
}));