import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import { Op } from "sequelize";
import { Group } from "@models/Group";
import { Credential } from "@models/Credential";
import type { FindOptions } from "sequelize";

import {
  ApiPath,
  ApiOperationGet,
  ApiOperationPost,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

@ApiPath({
  path: "/api/credentials/",
  name: "Credential",
  security: { apiKeyHeader: [] },
})
export class CredentialsRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      this.getCredentials
    );
    this.router.post(
      "/",
      passport.authenticate("jwt", { session: false }),
      this.createCredential
    );
  }

  @ApiOperationGet({
    description: "Get Credentials",
    summary: "Get Credentials",
    responses: {
      200: {
        description: "Success",
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
        model: "CredentialGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getCredentials(req: Request, res: Response): void {
    if (!req.user) {
      res.status(StatusCodes.FORBIDDEN).send();
      return;
    }
    const where = {} as FindOptions;
    if (!req.user.isAdmin) {
      try {
        const groups = req.user.groups;
        if (!groups) {
          res.send([]);
          return;
        }
        where.where = {
          [Op.or]: groups.map((group: Group) => ({ groupid: group.id })),
        };
      } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
        return;
      }
    }
    Credential.findAll(where)
      .then((credentials) =>
        credentials
          ? res
              .status(StatusCodes.OK)
              .json(credentials.map((credential) => credential.toJSON()))
          : res.status(StatusCodes.NOT_FOUND).send()
      )
      .catch((err) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err));
  }

  @ApiOperationPost({
    description: "Create Credential",
    summary: "Create Credential",
    parameters: {
      body: {
        name: "Credential",
        type: "Credential",
        required: true,
        allowEmptyValue: false,
        model: "CredentialPost",
      },
    },
    responses: {
      201: {
        description: "Success",
        type: "Credential",
        model: "CredentialGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  createCredential(req: Request, res: Response): void {
    if (!req.user) {
      res.status(StatusCodes.FORBIDDEN).send();
      return;
    }
    if (!req.user.isAdmin) {
      // Non-admins can only create a cred in a group they belong to
      const groups = req.user.groups;
      if (
        !groups ||
        !req.body.groupid ||
        !groups.map((group: Group) => group.id).includes(req.body.groupid)
      ) {
        res.status(StatusCodes.FORBIDDEN).send();
        return;
      }
    }
    Credential.create(req.body)
      .then((credential) =>
        res.status(StatusCodes.CREATED).json(credential.toJSON())
      )
      .catch((err) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err));
  }
  getRouter(): Router {
    return this.router;
  }
}
