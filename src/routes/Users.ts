import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import passport from "passport";
import { createValidator } from "express-joi-validation";
import { User } from "@models/User";
import { ApiPath, ApiOperationPost } from "swagger-express-typescript";
import config from "../config";

@ApiPath({
  path: "/api/users/",
  name: "User",
  security: { apiKeyHeader: [] },
})
export class UsersRouter {
  private router: Router;
  private validator;

  constructor() {
    this.router = Router();
    this.validator = createValidator();
    this.router.post(
      "/",
      passport.authenticate("jwt", { session: false }),
      this.createUser
    );
  }

  @ApiOperationPost({
    description: "Create user",
    summary: "Create user",
    parameters: {
      body: {
        name: "user",
        type: "User",
        required: true,
        allowEmptyValue: false,
        model: "UserPost",
      },
    },
    responses: {
      201: {
        description: "Created",
        type: "User",
        model: "UserGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  createUser(req: Request, res: Response): void {
    if (req.user && req.user.isAdmin) {
      const uuid = uuidv4();
      bcrypt.hash(uuid, 10).then((apiToken: string) => {
        const toCreate = {
          name: req.body.name,
          isAdmin: req.body.isAdmin,
          apiToken,
        };
        User.create(toCreate)
          .then((user) =>
            res.status(StatusCodes.CREATED).json({
              id: user.id,
              token: jwt.sign(
                { name: user.name, apiToken: uuid },
                config.jwtSecret
              ),
            })
          )
          .catch((err) =>
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err)
          );
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).send();
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
