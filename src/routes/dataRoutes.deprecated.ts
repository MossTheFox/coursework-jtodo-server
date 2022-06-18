/**
 * @file /data
 */

 import { Router } from "express";
 import { isValidObjectId } from "mongoose";
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
 
 // may not use
 router.get("/user", async (req, res) => {
     try {
         res.setHeader("Content-Type", "application/json; charset=utf-8");
         res.send({
             code: "ok",
             data: {
                 // don't send unionID
                 username: req.user.username,
                 avatarUrl: req.user.avatarUrl,
                 registeredAt: req.user.registeredAt
             }
         })
     } catch (err) {
         res.status(500).send({
             code: "error",
             message: "Internal Server Error"
         });
     }
 });
 
 // skip - not implemented
 router.put("/user/username", async (req, res) => {
     try {
         let username = req.body.username;
         if (!username) {
             res.status(400).send("Bad Request");
             return;
         }
         req.user.username = username;
         await req.user.save();
         res.setHeader("Content-Type", "application/json; charset=utf-8");
         res.send({
             code: "ok"
         });
     } catch (err) {
         res.status(500).send("Internal Server Error");
     }
 });
 
 /**
  * Get collection list
  */
 router.get("/collection", async (req, res) => {
     try {
         res.setHeader("Content-Type", "application/json; charset=utf-8");
         let usrCollections = await ListCollection.find({
             owner: req.user.qqUnionID
         }).lean();
 
         let sendData = usrCollections.map((doc) => ({
             // id: doc._id,
             uuid: doc.uuid,
             name: doc.name,
             description: doc.description,
             createdAt: doc.createdAt,
         }));
 
         res.send({
             code: "ok",
             data: sendData
         });
 
     } catch (err) {
         res.status(500).send({
             code: "error",
             message: "Internal Server Error"
         });
     }
 });
 
 /**
  * Get all items in specific collection
  */
 router.get("/collection/:id", async (req, res) => {
     try {
         res.setHeader("Content-Type", "application/json; charset=utf-8");
         let id = req.params.id;
         if (!isValidObjectId(id)) {
             res.status(404).send({
                 code: "error",
                 message: "Not Found"
             });
             return;
         }
 
         let items = await CollectionItem.find({
             inCollection: id
         });
 
         let sendData = items.map((doc) => ({
             // id: doc._id,
             uuid: doc.uuid,
             name: doc.name,
             description: doc.description,
             createdAt: doc.createdAt,
             checked: doc.checked,
         })).sort((a, b) => {
             return a.createdAt.getTime() - b.createdAt.getTime();
         });
 
         res.send({
             code: "ok",
             data: sendData
         });
     } catch (err) {
         res.status(500).send({
             code: "error",
             message: "Internal Server Error"
         });
     }
 });
 
 /**
  * Get all items belongs to the user (maybe implement this one)
  */
 router.get("/item", async (req, res) => {
     try {
         let userCollectionUUIDs = (await ListCollection.find({
             owner: req.user.qqUnionID
         }).lean()).map((doc) => doc.uuid);
 
         let userItems = await CollectionItem.find({
             uuid: {
                 $in: userCollectionUUIDs
             }
         });
 
         let sendData = userItems.map((doc) => ({
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
             data: sendData
         });
 
     } catch (err) {
         res.status(500).send({
             code: "err",
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