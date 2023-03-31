import jwt from "jsonwebtoken";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

export const verifyToken = (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const cookies = context.req.headers.cookie;
  const token =
    context.req.headers.authorization?.split(" ")[1] ||
    cookies?.split("auth_token=")[1].split(";")[0] ||
    "";

  if (!token) {
    return false;
  }

  return jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return false;
    }

    return true;
  });
};
