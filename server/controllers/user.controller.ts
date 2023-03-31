import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../helpers/client";

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void | Response<any, any>> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.header("set-cookie", `auth_token=${token}; path=/; httpOnly=true;`);
  res.json({ token });
};

//change password
export const changeUserPassword = async (
  req: Request,
  res: Response
): Promise<void | Response<any, any>> => {
  //check email and pass supplied are correct and match the logged in userid
  const { email, password, newPassword } = req.body;
  const userId = req.userId;
  if (!email || !password || !newPassword) {
    return res.status(400).json({
      message: "Fields 'email', 'password' and 'newPassword' are required",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || user.passwordHash !== password || user.email !== email) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: newPassword,
    },
  });

  res.json({ message: "Password changed successfully" });
};

//admins can make users
export const createUser = async (
  req: Request,
  res: Response
): Promise<void | Response<any, any>> => {
  const userId = req.userId;
  //only admins can create users
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user?.isAdmin !== true) {
    return res.status(401).json({ message: "only admins can make users" });
  }

  const { email, password, isAdmin } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "fields 'email' and 'password' are required" });
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash: password,
      isAdmin,
    },
  });

  res.json(newUser);
};
