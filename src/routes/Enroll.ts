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
import { RecipientIssuance } from "../models/RecipientIssuance";
import { Credential } from "../models/Credential";
import { Recipient } from "../models/Recipient";
import { Issuance } from "../models/Issuance";

import type { Group } from "../models/Group";
import type { EnrollmentModel } from "../apimodels/enrollment.model";

import {
  ApiPath,
  ApiOperationGet,
  ApiOperationPost,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

@ApiPath({
  path: "/api/enroll/{issuanceId}",
  name: "Enroll",
  security: { apiKeyHeader: [] },
})
export class EnrollRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get(
      "/:issuanceId",
      passport.authenticate("jwt", { session: false }),
      this.getEnrolled
    );
    this.router.post(
      "/:issuanceId",
      passport.authenticate("jwt", { session: false }),
      this.enrollRecipients
    );
  }

  @ApiOperationGet({
    description: "Get Enrolled",
    summary: "Get Enrolled Recipients",
    parameters: {
      path: {
        issuanceId: {
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
        model: "RecipientGet",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  getEnrolled(req: Request, res: Response): void {
    if (!req.user) {
      res.status(UNAUTHORIZED).send();
      return;
    }
    if (!req.params.issuanceId) {
      res.status(BAD_REQUEST).send();
      return;
    }
    Issuance.findOne({
      where: { id: req.params.issuanceId },
      include: [Credential, Recipient],
    })
      .then((issuance) => {
        if (!issuance) {
          res.status(NOT_FOUND).send();
          return;
        }
        if (!req.user.isAdmin) {
          const groupids = req.user.groups.map((group: Group) => group.id);
          if (
            !req.user.groups ||
            !groupids.includes(issuance.credential.groupid)
          ) {
            res.status(UNAUTHORIZED).send();
            return;
          }
        }
        const recipients = issuance.recipients;
        recipients
          ? res
              .status(OK)
              .json(recipients.map((recipient) => recipient.toJSON()))
          : res.status(NOT_FOUND).send();
      })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }

  @ApiOperationPost({
    description: "Enroll Recipients",
    summary: "Enroll Recipients to an Issuance",
    parameters: {
      body: {
        name: "Recipients",
        type: SwaggerDefinitionConstant.Parameter.Type.ARRAY,
        required: true,
        allowEmptyValue: false,
        model: "Enrollment",
      },
      path: {
        issuanceId: {
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
  enrollRecipients(req: Request, res: Response): void {
    if (!req.user) {
      res.status(UNAUTHORIZED).send();
      return;
    }
    Issuance.findOne({
      where: { id: req.params.issuanceId },
      include: Credential,
    })
      .then((issuance) => {
        if (issuance === null) {
          res.status(NOT_FOUND).send();
          return;
        }
        if (!req.user.isAdmin) {
          // Non-admins can only enroll users to issuances that they created
          const groupids = req.user.groups.map((group: Group) => group.id);
          if (
            !req.user.groups ||
            !groupids.includes(issuance.credential.groupid)
          ) {
            res.status(UNAUTHORIZED).send();
            return;
          }
        }
        req.body.forEach((enrollment: EnrollmentModel) => {
          const ri = {
            recipient: enrollment.recipientId,
            isApproved: enrollment.isApproved,
            ...(enrollment.isApproved ? { approvedAt: new Date() } : null),
            issuance: req.params.issuanceId,
          };
          RecipientIssuance.create(ri).then((issuance) =>
            res.status(CREATED).json(issuance.toJSON())
          );
        });
      })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }
  getRouter(): Router {
    return this.router;
  }
}
