import express from 'express';
const router = express.Router();
import {createUser, getUsers, checkUser, getUserByFirebaseUid} from "../controllers/userController.js";


router.post("/", createUser);
router.get("/", getUsers);
router.get("/check", checkUser);
router.get("/firebase/:firebaseUid", getUserByFirebaseUid);

export default router;
