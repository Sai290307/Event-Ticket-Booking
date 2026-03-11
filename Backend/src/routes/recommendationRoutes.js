import  Router  from "express";
const router = Router();
import  {recommend}  from "../controllers/recommendationController.js";

router.get("/:userId", recommend);

export default router;
