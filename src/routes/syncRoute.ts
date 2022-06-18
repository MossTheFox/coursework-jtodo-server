import { Router } from "express";
import CollectionItem from "../model/userDataDB/CollectionItem";
import { ListCollection } from "../model/userDataDB/ListCollection";
import { ActionType, CreateCollectionPayload, CreateItemPayload, DeleteCollectionPayload, DeleteItemPayload, UpdateItemPayload } from "./sync/actionTypes";

const router = Router();

// 记得阻止出现重复的 UUID

router.patch("/", async (req, res) => {
    try {
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!req.body.actions || !Array.isArray(req.body.actions)) {
            console.log("[syncRoute] invalid actions (req.body.actions)");
            res.status(400).send({
                code: "error",
                message: "Bad Request"
            });
            return;
        }

        let actions = req.body.actions as Array<{ type: ActionType, payload: any }>;
        for (let action of actions) {
            // stop if payload has more than one level, which is not allowed
            let flagged = false;
            Object.keys(action.payload).forEach((key) => {
                if (typeof action.payload[key] === "object") {
                    flagged = true;
                }
            });
            if (flagged) {
                console.log("[syncRoute] invalid payload (action.payload)");
                res.status(400).send({
                    code: "error",
                    message: "Bad Request"
                });
                return;
            }

            switch (action.type) {
                case "createCollection":
                    let payload = action.payload as CreateCollectionPayload;
                    await ListCollection.create({
                        owner: req.user.qqUnionID,
                        uuid: payload.uuid,
                        name: payload.name,
                        description: payload.description ?? "",
                        createdAt: new Date(),
                    });
                    break;
                // update collection name [todo]
                case "deleteCollection":
                    let payload2 = action.payload as DeleteCollectionPayload;
                    await ListCollection.deleteOne({
                        uuid: payload2.uuid
                    });
                    await CollectionItem.deleteMany({
                        inCollection: payload2.uuid
                    });
                    break;
                case "createItem":
                    let payload3 = action.payload as CreateItemPayload;
                    await CollectionItem.create({
                        uuid: payload3.uuid,
                        inCollection: payload3.inCollection,
                        name: payload3.name,
                        description: payload3.description ?? "",
                        createdAt: new Date(),
                        checked: false
                    });
                    break;
                case "updateItem":
                    let payload4 = action.payload as UpdateItemPayload;
                    await CollectionItem.updateOne({
                        uuid: payload4.uuid
                    }, {
                        ...payload4,
                    });
                    break;
                case "deleteItem":
                    let payload5 = action.payload as DeleteItemPayload;
                    await CollectionItem.deleteOne({
                        uuid: payload5.uuid
                    });
                    break;
                // other cases [todo]

                default:
                    console.log(`[${new Date().toLocaleString()}] Unknown action type: ${action.type}`);
                    break;
            }
        }

        res.send({
            code: "ok",
            message: "Nothing goes wrong"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            code: "err",
            message: "Internal Server Error"
        });
    }
});


export default router;