import { Request, Response, Router } from "express";
import { BAD_REQUEST, CREATED, OK } from "http-status-codes";
import { ParamsDictionary } from "express-serve-static-core";
import passport from "passport";

import {
  ApiPath,
  ApiOperationGet,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

@ApiPath({
  path: "/api/recipients/{did}",
  name: "Recipient",
  security: { apiKeyHeader: [] },
})
export class RecipientsRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get(
      "/:did",
      passport.authenticate("jwt", { session: false }),
      this.getRecipientByDid
    );
  }

  @ApiOperationGet({
    description: "Get recipient by did",
    summary: "Get recipient",
    parameters: {
      path: {
        did: {
          name: "did",
          description: "User did",
          type: "string",
          allowEmptyValue: false,
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
        model: "Recipient",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getRecipientByDid(req: Request, res: Response): void {
    res.status(OK).json({});
  }

  getRouter(): Router {
    return this.router;
  }
}
