import { Request, Response, Router } from "express";
import {
  BAD_REQUEST,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "http-status-codes";
import { Group } from "@models/Group";
import { Issuance } from "@models/Issuance";
import { Recipient } from "@models/Recipient";
import { Credential } from "@models/Credential";
import { RecipientIssuance } from "@models/RecipientIssuance";
import {
  ApiPath,
  ApiOperationGet,
  ApiOperationPost,
  SwaggerDefinitionConstant,
} from "swagger-express-typescript";
import { createIssuer } from "@digitalcredentials/sign-and-verify-core";
import parse from "json-templates";
import QRCode from "qrcode";

@ApiPath({
  path: "/api/claim/{awardId}",
  name: "Claim",
})
export class ClaimRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get("/:recipientId/:issuanceId", this.getClaim);
    this.router.post("/:awardId", this.postClaim);
  }

  @ApiOperationGet({
    description: "Claim an issued credential",
    summary: "Claim an issued credential",
    parameters: {
      path: {
        recipientId: {
          type: SwaggerDefinitionConstant.Parameter.Type.STRING,
          required: true,
          allowEmptyValue: false,
        },
        issuanceId: {
          type: SwaggerDefinitionConstant.Parameter.Type.STRING,
          required: true,
          allowEmptyValue: false,
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
        model: "ClaimGet",
      },
    },
  })
  getClaim(req: Request, res: Response): void {
    if (!req.params.issuanceId || !req.params.recipientId) {
      res.status(BAD_REQUEST).send();
      return;
    }
    RecipientIssuance.findOne({
      where: {
        issuanceId: req.params.issuanceId,
        recipientId: req.params.recipientId,
      },
      include: [Recipient, { model: Issuance, include: [Credential] }],
    })
      .then((award) => {
        if (!award) {
          res.status(NOT_FOUND).send();
          return;
        }
        const url = `dccrequest:request?request_url=${process.env.PUBLIC_URL}/api/claim/${award.awardId}`;
        QRCode.toDataURL(url).then((qr) => {
          const claim = {
            url,
            qr,
            title: award.issuance.credential.title,
          };
          res.status(OK).json(claim);
        });
      })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }

  @ApiOperationPost({
    description: "Claim an issued credential",
    summary: "Claim an issued credential",
    parameters: {
      path: {
        awardId: {
          type: SwaggerDefinitionConstant.Parameter.Type.STRING,
          required: true,
          allowEmptyValue: false,
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
        model: "ClaimPost",
      },
    },
  })
  postClaim(req: Request, res: Response): void {
    if (!req.params.awardId) {
      res.status(BAD_REQUEST).send();
      return;
    }
    RecipientIssuance.findOne({
      where: { awardId: req.params.awardId },
      include: [
        Recipient,
        { model: Issuance, include: [{ model: Credential, include: [Group] }] },
      ],
    })
      .then((award) => {
        if (!award) {
          res.status(NOT_FOUND).send();
          return;
        }
        if (!req.body.holder) {
          res.status(BAD_REQUEST).send();
          return;
        }
        if (!award.recipient.did) {
          award.recipient.did = req.body.holder;
          award.recipient.save();
        }
        if (!award.isApproved) {
          res.status(UNAUTHORIZED).send();
          return;
        }
        const templateVals = {
          AWARD_URL: `${process.env.PUBLIC_URL}/api/issuance/${award.issuance.id}`,
          ISSUER_DID: award.issuance.credential.group.didDoc.id,
          ISSUER_NAME: award.issuance.credential.group.name,
          DATE: award.issuance.issueDate.toISOString(),
          RECIPIENT_DID: req.body.holder,
          RECIPIENT_EMAIL: award.recipient.email,
          RECIPIENT_NAME: award.recipient.name,
          ISSUANCE_URL: req.originalUrl,
        };
        const template = parse(award.issuance.credential.template);
        const populated = template(templateVals);
        const { sign } = createIssuer([award.issuance.credential.group.didDoc]);
        award.issuedAt = new Date();
        award.save();
        sign(populated, {
          verificationMethod: award.issuance.credential.group.didKeyId,
        }).then((signed) => {
          res.status(OK).json(signed);
        });
      })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(err));
  }

  getRouter(): Router {
    return this.router;
  }
}
