/**
 * @file /data
 */

import { Router } from "express";
import AccountCore, { createToken, verifyToken } from "../model/owlUserDB/AccountCore";
import CollectionItem from "../model/userDataDB/CollectionItem";
import { ListCollection } from "../model/userDataDB/ListCollection";

const router = Router();

/**
 * expected authorization header:
 * Authorization: Bearer <token>
 * 
 * 
 * 获取用户信息：
 *  GET /data/user/
 * 获取用户的 Collection 列表：
 *  GET /data/collection
 *      
 */


router.use(async (req, res, next) => {
    try {
        if (req.method === "OPTIONS") {
            next();
            return;
        }
        let auth = req.headers.authorization;
        if (!auth) {
            res.status(401).send("Unauthorized");
            return;
        }
        let token = auth.split(" ")[1];
        let qqUnionID = verifyToken(token);
        if (!qqUnionID) {
            res.status(401).send("Unauthorized");
            return;
        }
        let userDoc = await AccountCore.findOne({ qqUnionID });
        if (!userDoc) {
            res.status(401).send("Unauthorized");
            return;
        }
        req.user = userDoc;
        next();
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

/**
 * 还是一次性发送全部吧
 */
router.get("/", async (req, res) => {
    try {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        let usrCollections = await ListCollection.find({
            owner: req.user.qqUnionID
        }).lean();

        let sendCollections = usrCollections.map((doc) => ({
            // id: doc._id,
            uuid: doc.uuid,
            name: doc.name,
            description: doc.description,
            createdAt: doc.createdAt,
        }));

        let userCollectionUUIDs = sendCollections.map((doc) => doc.uuid);

        let userItems = await CollectionItem.find({
            inCollection: { $in: userCollectionUUIDs }
        });

        let sendItems = userItems.map((doc) => ({
            uuid: doc.uuid,
            inCollection: doc.inCollection,
            name: doc.name,
            description: doc.description,
            createdAt: doc.createdAt,
            // updatedAt: 
            checked: doc.checked
        })).sort((a, b) => {
            return a.createdAt.getTime() - b.createdAt.getTime();
        });

        res.send({
            code: "ok",
            data: {
                collections: sendCollections,
                items: sendItems
            }
        });

    } catch (err) {
        res.status(500).send({
            code: "error",
            message: "Internal Server Error"
        });
    }
});

/**
 * Sync:
 * 
 * req.body.actions
 */
import syncRoute from "./syncRoute";
router.use("/sync", syncRoute);


export default router;