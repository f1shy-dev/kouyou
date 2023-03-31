// declare namespace Express {
//   export interface Request {
//     userId?: string;
//     // prisma: PrismaClient;
//   }
// }

// // import { Request as ExpressRequest } from "express";
// // import { PrismaClient } from "@prisma/client";

// // declare module "express" {
// //   interface SSRRequest extends ExpressRequest {
// //     prisma: PrismaClient;
// //     userId?: string;
// //   }
// // }

import { PrismaClient } from "@prisma/client";
import { Request } from "express";

declare module "express" {
  export interface Request {
    // prisma: PrismaClient;
    userId?: string;
  }
}
