import { Router } from "express";
import {
  changeUserPassword,
  loginUser,
  logoutUser,
} from "../controllers/user.controller";
import { verifyToken } from "../helpers/verifyToken";

const userRouter = Router();

userRouter.post("/login", loginUser);
userRouter.get("/logout", verifyToken, logoutUser);
userRouter.post("/change-password", verifyToken, changeUserPassword);

export default userRouter;
