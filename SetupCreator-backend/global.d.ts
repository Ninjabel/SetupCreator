import { Role } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      AUTH_SECRET: string;
      REFTESH_SECRET: string;
    }
  }

  namespace Express {
    interface Locals {
      userId: string;
      userRole: Role;
    }
  }
}

declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: string;
  }
}

export {};
