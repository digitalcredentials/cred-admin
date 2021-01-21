import { Request, Response, Router } from "express";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "http-status-codes";
import passport from "passport";
import sequelize from "../sequelize";
import type { Model } from "sequelize";
import type { EnrollmentModel } from "../apimodels/enrollment.model";
import type { RecipientIssuance } from "../models/RecipientIssuance";

import {
  ApiPath,
  ApiOperationGet,
  ApiOperationPost,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";

@ApiPath({
  path: "/api/enroll/",
  name: "Enroll",
  security: { apiKeyHeader: [] },
})
export class EnrollRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get(
      "/:credentialId",
      passport.authenticate("jwt", { session: false }),
      this.getEnrolled
    );
    this.router.post(
      "/:credentialId",
      passport.authenticate("jwt", { session: false }),
      this.enrollRecipients
    );
  }

  @ApiOperationGet({
    description: "Get Enrolled",
    summary: "Get Enrolled Recipients",
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
  getEnrolled(req: Request, res: Response): void {
    if (!req.user) {
      res.status(FORBIDDEN);
      return;
    }
    if (!req.params.credentialId) {
      res.status(BAD_REQUEST);
      return;
    }
    sequelize.models.Issuance.findAll({
      where: { credentialid: req.params.credentialId },
      include: [sequelize.models.Credential, sequelize.models.Recipients],
    })
      .then((issuances: Array<Model>) => {
        const cred = issuances[0].get("Credential") as Model;
        if (!req.user.isAdmin) {
          const groups = req.user.groups;
          if (!groups || !groups.includes(cred.get("groupid"))) {
            res.status(FORBIDDEN);
            return;
          }
        }
        const recipients = issuances[0].get("Recipients") as Array<Model>;
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
    },
    responses: {
      200: {
        description: "Success",
        type: "Issuance",
        model: "Issuance",
      },
    },
    security: {
      apiKeyHeader: [],
    },
  })
  enrollRecipients(req: Request, res: Response): void {
    if (!req.user) {
      res.status(FORBIDDEN);
      return;
    }
    if (!req.user.isAdmin) {
      // Non-admins can only enroll users to issuances that they created
      sequelize.models.Issuance.findOne({
        where: { issuanceid: req.params.issuanceId },
        include: sequelize.models.Credential,
      }).then((issuance) => {
        if (issuance === null) {
          res.status(NOT_FOUND);
          return;
        }
        const cred = issuance.get("Credential") as Model;
        if (!req.user.isAdmin) {
          const groups = req.user.groups;
          if (!groups || !groups.includes(cred.get("groupid"))) {
            res.status(FORBIDDEN);
            return;
          }
        }
      });
    }
    req.body.forEach((enrollment: EnrollmentModel) => {
      const ri = {
        recipient: enrollment.recipientId,
        isApproved: enrollment.isApproved,
        ...(enrollment.isApproved ? { approvedAt: new Date() } : null),
        issuance: req.params.issuanceId,
      };
      sequelize.models.RecipientIssuance.create(ri)
        .then((issuance) => res.status(CREATED).json(issuance.toJSON()))
        .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
    });
  }
  getRouter(): Router {
    return this.router;
  }
}
