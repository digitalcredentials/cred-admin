import { Request, Response, Router } from "express";
import {
  CREATED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "http-status-codes";
import passport from "passport";
import sequelize from "../sequelize";
import { Op } from "sequelize";
import type { FindOptions } from "sequelize";
import type { Group } from "../models/Group";
import type { Credential } from "../models/Credential";

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
        model: "Credential",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getCredentials(req: Request, res: Response): void {
    if (!req.user) {
      res.status(FORBIDDEN);
      return;
    }
    const sendCredentials = (credentials: Array<Credential>) =>
      credentials
        ? res
            .status(OK)
            .json(credentials.map((credential) => credential.toJSON()))
        : res.status(NOT_FOUND).send();
    if (!req.user.isAdmin) {
      req.user
        .getGroups()
        .then((groups: Array<Group>) => {
          if (!groups) {
            res.send({});
            return;
          }
          return {
            where: {
              [Op.or]: groups.map((group: Group) => ({ groupid: group.id })),
            },
          };
        })
        .then((where: FindOptions) =>
          sequelize.models.Credential.findAll(where)
        )
        .then(sendCredentials)
        .catch((err: Error) => res.status(INTERNAL_SERVER_ERROR).send(err));
    } else {
      sequelize.models.Credential.findAll()
        .then(sendCredentials)
        .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
    }
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
        model: "Credential",
      },
    },
    responses: {
      200: {
        description: "Success",
        type: "Credential",
        model: "Credential",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  createCredential(req: Request, res: Response): void {
    sequelize.models.Credential.create(req.body)
      .then((credential) => res.status(CREATED).json(credential.toJSON()))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }
  getRouter(): Router {
    return this.router;
  }
}
