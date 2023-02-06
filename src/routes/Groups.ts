import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import { User } from "@models/User";
import { Group } from "@models/Group";

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
    this.router.post(
      "/:gid/:uid",
      passport.authenticate("jwt", { session: false }),
      this.addUserToGroup
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
      res.status(StatusCodes.UNAUTHORIZED).send();
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
      Group.create(req.body)
        .then((group) => res.status(StatusCodes.CREATED).json(group.toJSON()))
        .catch((err) =>
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err)
        );
    } else {
      res.status(StatusCodes.UNAUTHORIZED).send();
    }
  }

  @ApiOperationPost({
    description: "Add User to Group",
    summary: "Add a User to a Group",
    path: "{gid}/{uid}",
    parameters: {
      path: {
        gid: {
          type: SwaggerDefinitionConstant.Parameter.Type.NUMBER,
          required: true,
          allowEmptyValue: false,
        },
        uid: {
          type: SwaggerDefinitionConstant.Parameter.Type.NUMBER,
          required: true,
          allowEmptyValue: false,
        },
      },
    },
    responses: {
      200: {
        description: "Success",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  addUserToGroup(req: Request, res: Response): void {
    if (req.user && req.user.isAdmin) {
      Group.findOne({ where: { id: req.params.gid } })
        .then((group) =>
          User.findOne({
            where: { id: req.params.uid },
          }).then((user) =>
            group && user
              ? group
                  .$add("User", user)
                  .then(() => res.status(StatusCodes.OK).send())
              : res.status(StatusCodes.NOT_FOUND).send()
          )
        )
        .catch((err) =>
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err)
        );
    } else {
      res.status(StatusCodes.UNAUTHORIZED).send();
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
