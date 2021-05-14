import { User } from "@models/User";

declare module "express" {
  export interface Request {
    user?: any;
  }
}
