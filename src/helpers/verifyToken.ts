import jwt from "jsonwebtoken";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

export const verifyToken = (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const token = (context.req.headers.authorization || "").split(" ")[1];

  if (!token) {
    return false;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return false;
    }

    return true;
  });
};
