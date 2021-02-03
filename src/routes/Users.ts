import { Request, Response, Router } from "express";
import {
  CREATED,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import passport from "passport";
import { createValidator } from "express-joi-validation";
import { User } from "../models/User";

import {
  ApiPath,
  ApiOperationPost,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

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
        type: SwaggerDefinitionConstant.Response.Type.STRING,
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
            res
              .status(CREATED)
              .json(
                jwt.sign(
                  { name: user.name, apiToken: uuid },
                  process.env.CA_JWT_TOKEN || "secret"
                )
              )
          )
          .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
      });
    } else {
      res.status(UNAUTHORIZED).send();
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
