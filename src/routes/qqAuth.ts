/**
 * @file /auth
 */
import { Router } from "express";
import AccountCore, { createToken } from "../model/owlUserDB/AccountCore";
import { QQAuthData } from "../model/owlUserDB/QQAuthData";
// import CollectionItem from "../model/userDataDB/CollectionItem";
import { ListCollection } from "../model/userDataDB/ListCollection";

const router = Router();

router.post("/", async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
        if (!req.body.qqAuth) {
            res.status(400).send({
                code: "bad_request",
                message: "No."
            });
            return;
        }
        let qqAuthRecord = await QQAuthData.findOne({
            _id: req.body.qqAuth,
            available: true
        });

        if (!qqAuthRecord) {
            res.send({
                code: "not ok",
                message: "未完成授权"
            });
            return;
        }

        // check if account exists. Auto create if not exists.

        let userDoc = await AccountCore.findOne({
            qqUnionID: qqAuthRecord.unionID
        });
        if (!userDoc) {
            // create account
            userDoc = new AccountCore({
                qqUnionID: qqAuthRecord.unionID,
                username: qqAuthRecord.rawGetUserInfoResponse?.nickname || "User",
                avatar: qqAuthRecord.rawGetUserInfoResponse?.figureurl_qq_2 || "",
                registeredAt: new Date()
            });
            // ...and give some default listCollection
            let newList = await ListCollection.create({
                owner: userDoc.qqUnionID,
                name: "待办事项",
                description: "默认列表",
                createdAt: new Date()
            });

            // await CollectionItem.create({
            //     inCollection: newList._id,
            //     name: ""
            // });
        }
        // check field update (actually not really needed)
        userDoc.avatarUrl = qqAuthRecord.rawGetUserInfoResponse?.figureurl_qq;
        userDoc.username = qqAuthRecord.rawGetUserInfoResponse?.nickname;

        await userDoc.save();

        let jwtToken = createToken(userDoc.qqUnionID);

        // deactivate qqAuthRecord
        qqAuthRecord.available = false;
        await qqAuthRecord.save();

        res.send({
            code: "ok",
            data: {
                username: userDoc.username,
                avatarUrl: userDoc.avatarUrl,
                registeredAt: userDoc.registeredAt,
                token: jwtToken     // 客户端存储这个 Token 作为后面所有请求的 Authorization 字段 (Bearer)
            }
        });
    } catch (err) {
        res.status(500).send({
            code: 'error',
            message: "Internal Server Error"
        })
    }
});


export default router;