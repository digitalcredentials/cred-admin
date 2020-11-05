import { Request, Response, Router } from "express";
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "http-status-codes";
import { ParamsDictionary } from "express-serve-static-core";
import passport from "passport";
import * as Joi from "@hapi/joi";
import {
  ContainerTypes,
  ValidatedRequest,
  ValidatedRequestSchema,
  createValidator,
} from "express-joi-validation";
import sequelize from "../sequelize";
import "joi-extract-type";

import {
  ApiPath,
  ApiOperationGet,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

const querySchema = Joi.object({
  did: Joi.string(),
  email: Joi.string(),
});

interface RecipientRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: Joi.extractType<typeof querySchema>;
}

@ApiPath({
  path: "/api/recipients/",
  name: "Recipient",
  security: { apiKeyHeader: [] },
})
export class RecipientsRouter {
  private router: Router;
  private validator;

  constructor() {
    this.router = Router();
    this.validator = createValidator();
    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      this.validator.query(querySchema),
      this.getRecipient
    );
  }

  @ApiOperationGet({
    description: "Get recipient",
    summary: "Get recipient",
    parameters: {
      query: {
        did: {
          name: "did",
          description: "User did",
          type: "string",
          allowEmptyValue: true,
        },
        email: {
          name: "email",
          description: "User email",
          type: "string",
          allowEmptyValue: true,
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
  getRecipient(
    req: ValidatedRequest<RecipientRequestSchema>,
    res: Response
  ): void {
    const where = {
      where: {
        ...(req.query.did ? { did: req.query.did } : null),
        ...(req.query.email ? { email: req.query.email } : null),
      },
    };
    if (Object.keys(where.where).length === 0) {
      res.status(BAD_REQUEST).send("Need an identifier to find user");
      return;
    }
    sequelize.models.Recipient.findOne(where)
      .then((recipient) =>
        recipient
          ? res.status(OK).json(recipient)
          : res.status(NOT_FOUND).send()
      )
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }

  getRouter(): Router {
    return this.router;
  }
}
