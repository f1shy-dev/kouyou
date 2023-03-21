import { Router } from "express";
import { changeUserPassword, loginUser } from "../controllers/user.controller";
import { verifyToken } from "../helpers/verifyToken";

const userRouter = Router();

userRouter.post("/login", loginUser);
userRouter.post("/change-password", verifyToken, changeUserPassword);

export default userRouter;
