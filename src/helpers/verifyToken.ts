import jwt from "jsonwebtoken";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

export const verifyToken = (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): [boolean, { userId: string } | null] => {
  const cookies = context.req.headers.cookie;
  const token =
    context.req.headers.authorization?.split(" ")[1] ||
    (cookies &&
      cookies?.includes("auth_token=") &&
      cookies?.split("auth_token=")[1].split(";")[0]) ||
    "";

  if (!token) {
    return [false, null];
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET!);
    return [true, data as { userId: string }];
  } catch (e) {
    return [false, null];
  }
};
