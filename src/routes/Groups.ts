import { Request, Response, Router } from "express";
import { FORBIDDEN } from "http-status-codes";
import passport from "passport";

import {
  ApiPath,
  ApiOperationGet,
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
  }

  @ApiOperationGet({
    description: "Get Groups",
    summary: "Get Groups",
    responses: {
      200: {
        description: "Success",
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
        model: "Group",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getGroups(req: Request, res: Response): void {
    if (!req.user) {
      res.status(FORBIDDEN);
      return;
    }
    res.send(req.user.groups);
  }

  getRouter(): Router {
    return this.router;
  }
}
