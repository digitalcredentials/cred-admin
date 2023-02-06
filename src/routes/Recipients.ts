import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import Joi from "joi";
import {
  ValidatedRequest,
  ValidatedRequestSchema,
  createValidator,
} from "express-joi-validation";
import { Recipient } from "@models/Recipient";

import {
  ApiPath,
  ApiOperationGet,
  ApiOperationPost,
} from "swagger-express-typescript";

const querySchema = Joi.object({
  id: Joi.number().integer().positive(),
  did: Joi.string(),
  email: Joi.string().email(),
  externalId: Joi.string(),
});

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
    this.router.post(
      "/",
      passport.authenticate("jwt", { session: false }),
      this.createRecipient
    );
  }

  @ApiOperationGet({
    description: "Get recipient",
    summary: "Get recipient",
    parameters: {
      query: {
        id: {
          name: "id",
          description: "User id",
          type: "integer",
          allowEmptyValue: false,
        },
        did: {
          name: "did",
          description: "User did",
          type: "string",
          allowEmptyValue: false,
        },
        email: {
          name: "email",
          description: "User email",
          type: "string",
          allowEmptyValue: false,
        },
        externalId: {
          name: "externalId",
          description: "External Identifier",
          type: "string",
          allowEmptyValue: false,
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        type: "Recipient",
        model: "RecipientGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getRecipient(
    req: ValidatedRequest<ValidatedRequestSchema>,
    res: Response
  ): void {
    const where = {
      where: {
        ...(req.query.id ? { id: req.query.id } : null),
        ...(req.query.did ? { did: req.query.did } : null),
        ...(req.query.email ? { email: req.query.email } : null),
        ...(req.query.externalId ? { externalId: req.query.externalId } : null),
      },
    };
    if (Object.keys(where.where).length === 0) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .send("Need an identifier to find user");
      return;
    }
    Recipient.findOne(where)
      .then((recipient) =>
        recipient
          ? res.status(StatusCodes.OK).json(recipient.toJSON())
          : res.status(StatusCodes.NOT_FOUND).send()
      )
      .catch((err) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err));
  }

  @ApiOperationPost({
    description: "Create recipient",
    summary: "Create recipient",
    parameters: {
      body: {
        name: "recipient",
        type: "Recipient",
        required: true,
        allowEmptyValue: false,
        model: "RecipientPost",
      },
    },
    responses: {
      201: {
        description: "Success",
        type: "Recipient",
        model: "RecipientGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  createRecipient(req: Request, res: Response): void {
    Recipient.create(req.body)
      .then((recipient) =>
        res.status(StatusCodes.CREATED).json(recipient.toJSON())
      )
      .catch((err) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err));
  }

  getRouter(): Router {
    return this.router;
  }
}
