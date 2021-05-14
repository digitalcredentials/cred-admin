import { Request, Response, Router } from "express";
import {
  BAD_REQUEST,
  CREATED,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "http-status-codes";
import passport from "passport";
import { Group } from "@models/Group";
import { Issuance } from "@models/Issuance";
import { Credential } from "@models/Credential";

import {
  ApiPath,
  ApiOperationGet,
  ApiOperationPost,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

@ApiPath({
  path: "/api/issuances/{credentialId}",
  name: "Issuance",
  security: { apiKeyHeader: [] },
})
export class IssuancesRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get(
      "/:credentialId",
      passport.authenticate("jwt", { session: false }),
      this.getIssuances
    );
    this.router.post(
      "/:credentialId",
      passport.authenticate("jwt", { session: false }),
      this.createIssuance
    );
  }

  @ApiOperationGet({
    description: "Get Issuances",
    summary: "Get Issuances",
    parameters: {
      path: {
        credentialId: {
          type: SwaggerDefinitionConstant.Parameter.Type.NUMBER,
          required: true,
          allowEmptyValue: false,
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
        model: "IssuanceGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getIssuances(req: Request, res: Response): void {
    if (!req.user) {
      res.status(UNAUTHORIZED).send();
      return;
    }
    if (!req.params.credentialId) {
      res.status(BAD_REQUEST).send();
      return;
    }
    Issuance.findAll({
      where: { credentialid: req.params.credentialId },
      include: Credential,
    })
      .then((issuances) => {
        if (!issuances || issuances.length === 0) {
          res.status(NOT_FOUND).send();
          return;
        }
        if (!req.user.isAdmin) {
          const groups = req.user.groups;
          if (
            !groups ||
            !groups
              .map((group: Group) => group.id)
              .includes(issuances[0].credential.groupid)
          ) {
            res.status(UNAUTHORIZED).send();
            return;
          }
        }
        res.status(OK).json(issuances.map((issuance) => issuance.toJSON()));
      })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }

  @ApiOperationPost({
    description: "Create Issuance",
    summary: "Create Issuance",
    parameters: {
      body: {
        name: "Issuance",
        type: "Issuance",
        required: true,
        allowEmptyValue: false,
        model: "IssuancePost",
      },
      path: {
        credentialId: {
          type: SwaggerDefinitionConstant.Parameter.Type.NUMBER,
          required: true,
          allowEmptyValue: false,
        },
      },
    },
    responses: {
      201: {
        description: "Success",
        type: "Issuance",
        model: "IssuanceGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  createIssuance(req: Request, res: Response): void {
    if (!req.user) {
      res.status(UNAUTHORIZED).send();
      return;
    }
    Credential.findOne({
      where: { id: req.params.credentialId },
    })
      .then((cred) => {
        if (!cred) {
          res.status(NOT_FOUND).send();
          return;
        }

        const groups = req.user.groups;
        if (
          !req.user.isAdmin &&
          (!groups ||
            !cred.groupid ||
            !groups.map((group: Group) => group.id).includes(cred.groupid))
        ) {
          // Non-admins can only create an issuance on a cred that belongs to their group
          res.status(UNAUTHORIZED).send();
          return;
        } else {
          req.body.issueDate = new Date(req.body.issueDate);
          cred
            .$create("issuance", req.body)
            .then((issuance) => res.status(CREATED).json(issuance.toJSON()));
        }
      })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }

  getRouter(): Router {
    return this.router;
  }
}
