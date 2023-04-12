import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
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
import {
  createIssuer,
  createVerifier,
} from "@digitalcredentials/sign-and-verify-core";
import axios from "axios";
import parse from "json-templates";
import QRCode from "qrcode";
import files from "../files";
import logger from "@shared/Logger";
import config from "../config";

import type { Readable } from "stream";

@ApiPath({
  path: "/api/claim/",
  name: "Claim",
})
export class ClaimRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get("/:recipientId/:issuanceId", this.getClaim);
    this.router.post("/", this.postClaim);
  }

  @ApiOperationGet({
    description: "Claim an issued credential",
    summary: "Claim an issued credential",
    path: "{recipientId}/{issuanceId}",
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
        type: "Claim",
        model: "ClaimGet",
      },
    },
  })
  getClaim(req: Request, res: Response): void {
    if (!req.params.issuanceId || !req.params.recipientId) {
      res.status(StatusCodes.BAD_REQUEST).send();
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
          res.status(StatusCodes.NOT_FOUND).send();
          return;
        }
        const reqUrl = encodeURIComponent(`${config.publicUrl}/api/claim/`);
        const url = `dccrequest://request?issuer=${encodeURIComponent(
          config.oidc.issuerUrl
        )}&vc_request_url=${reqUrl}&challenge=${award.awardId}&auth_type=code`;
        QRCode.toDataURL(url).then((qr) => {
          const claim = {
            url,
            qr,
            title: award.issuance.credential.title,
          };
          res.status(StatusCodes.OK).json(claim);
        });
      })
      .catch((err) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err));
  }

  @ApiOperationPost({
    description: "Claim an issued credential",
    summary: "Claim an issued credential",
    parameters: {},
    responses: {
      200: {
        description: "Success",
        type: "Claim",
        model: "ClaimPost",
      },
    },
  })
  async postClaim(req: Request, res: Response): Promise<Response> {
    logger.debug(JSON.stringify(req.body));
    if (!req.body.proof?.challenge || !req.body.holder) {
      return new Promise((resolve) =>
        resolve(
          res
            .status(StatusCodes.BAD_REQUEST)
            .send("Missing challenge or recipient DID")
        )
      );
    }
    const awardId = req.body.proof.challenge;

    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Missing OIDC token");
    }
    try {
      const OidcInfo = await axios.get(
        `${config.oidc.issuerUrl}${config.oidc.userinfoPath}`,
        {
          headers: {
            Authorization: authHeader,
          },
          validateStatus: (status) => status === 200,
        }
      );

      const OidcId = OidcInfo.data[config.oidc.compare];
      logger.debug(OidcId);

      const { verifyPresentation } = createVerifier([]);
      const didVerificationResult = await verifyPresentation({
        verifiablePresentation: req.body,
        issuerMembershipRegistry: {},
        options: { challenge: awardId },
      });

      if (!didVerificationResult.verified) {
        return res.status(StatusCodes.UNAUTHORIZED).send(didVerificationResult);
      }

      const award = await RecipientIssuance.findOne({
        where: { awardId },
        include: [
          Recipient,
          {
            model: Issuance,
            include: [{ model: Credential, include: [Group] }],
          },
        ],
      });
      if (!award) {
        return res.status(StatusCodes.NOT_FOUND).send();
      }
      if (
        OidcId !== award.recipient.externalId &&
        OidcId !== award.recipient.email
      ) {
        logger.warn(
          `Recipient mismatch: OIDC param "${config.oidc.compare}" was "${OidcId}", but recipient id is "${award.recipient.externalId} and email is "${award.recipient.email}"`
        );
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send("Logged in user doesn't match credential recipient.");
      }
      award.recipient.did = req.body.holder;
      award.recipient.save();
      if (!award.isApproved) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send(
            "Recipient has not completed requirements to receive this credential"
          );
      }
      if (!award.issuance.credential.group.didDoc) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Issuing Group has not been configured with a key");
      }
      const templateVals = {
        ...award.issuance.credential.templateValues,
        AWARD_URL: `${config.publicUrl}/api/issuance/${award.issuance.id}`,
        ISSUER_DID: award.issuance.credential.group.didDoc.id,
        ISSUER_NAME: award.issuance.credential.group.name,
        DATE: award.issuance.issueDate.toISOString(),
        RECIPIENT_DID: req.body.holder,
        RECIPIENT_EMAIL: award.recipient.email,
        RECIPIENT_NAME: award.recipient.name,
        ISSUANCE_ID: award.issuance.id.toString(10),
      };
      logger.debug(JSON.stringify(templateVals));
      const templateReadable = await files.getFileAsReadable(
        award.issuance.credential.templatePath
      );
      const readableToString = (readable: Readable): Promise<string> => {
        return new Promise((resolve, reject) => {
          const chunks: Array<any> = [];
          readable.on("data", (chunk) => chunks.push(chunk));
          readable.on("end", () =>
            resolve(Buffer.concat(chunks).toString("utf8"))
          );
          readable.on("error", (err) => reject(err));
        });
      };
      const templateJson = await readableToString(templateReadable);
      logger.debug(templateJson);
      const template = parse(JSON.parse(templateJson));
      logger.debug(JSON.stringify(template));
      const populated = template(templateVals);
      logger.debug(JSON.stringify(populated));
      const { sign } = createIssuer([award.issuance.credential.group.didDoc]);
      award.isIssued = true;
      award.issuedAt = new Date();
      const [, signed] = await Promise.all([
        award.save(),
        sign(populated, {
          verificationMethod: award.issuance.credential.group.didKeyId,
        }),
      ]).catch((err) => {
        logger.error("Signing Error!", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        return [];
      });
      return res.status(StatusCodes.OK).json(signed);
    } catch (err) {
      logger.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
