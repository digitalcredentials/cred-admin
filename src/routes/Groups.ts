import { Request, Response, Router } from "express";
import {
  CREATED,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} from "http-status-codes";
import passport from "passport";
import sequelize from "../sequelize";

import {
  ApiPath,
  ApiOperationGet,
  ApiOperationPost,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

@ApiPath({
  path: "/api/groups/",
  name: "Group",
  security: { apiKeyHeader: [] },
})
export class GroupRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      this.getGroups
    );
    this.router.post(
      "/",
      passport.authenticate("jwt", { session: false }),
      this.createGroup
    );
  }

  @ApiOperationGet({
    description: "Get Groups",
    summary: "Get Groups",
    responses: {
      200: {
        description: "Success",
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
        model: "GroupGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getGroups(req: Request, res: Response): void {
    if (!req.user) {
      res.status(UNAUTHORIZED);
      return;
    }
    res.send(req.user.groups);
  }

  @ApiOperationPost({
    description: "Create group",
    summary: "Create group",
    parameters: {
      body: {
        name: "group",
        type: "Group",
        required: true,
        allowEmptyValue: false,
        model: "GroupPost",
      },
    },
    responses: {
      201: {
        description: "Created",
        type: "Group",
        model: "GroupGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  createGroup(req: Request, res: Response): void {
    if (req.user && req.user.isAdmin) {
      sequelize.models.Group.create(req.body)
        .then((group) => res.status(CREATED).json(group.toJSON()))
        .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
    } else {
      res.status(UNAUTHORIZED);
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
