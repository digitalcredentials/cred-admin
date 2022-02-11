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
import {
  createIssuer,
  createVerifier,
} from "@digitalcredentials/sign-and-verify-core";
import axios from "axios";
import parse from "json-templates";
import QRCode from "qrcode";
import files from "../files";
import logger from "@shared/Logger";

import type { Readable } from "stream";

const oidcIssuerUrl = process.env.OIDC_ISSUER_URL
  ? process.env.OIDC_ISSUER_URL
  : "";

if (oidcIssuerUrl === "") {
  logger.error("ERROR: OIDC_ISSUER_URL not set!");
  process.exit(1);
}

const publicUrl = process.env.PUBLIC_URL
  ? process.env.PUBLIC_URL
  : logger.error("ERROR: PUBLIC_URL not set!");

@ApiPath({
  path: "/api/claim/{awardId}",
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
        const reqUrl = encodeURIComponent(`${publicUrl}/api/claim/`);
        const url = `dccrequest://request?issuer=${encodeURIComponent(
          oidcIssuerUrl
        )}&vc_request_url=${reqUrl}&challenge=${award.awardId}&auth_type=code`;
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
    if (!req.body.proof?.challenge || !req.body.holder) {
      return new Promise((resolve) =>
        resolve(
          res.status(BAD_REQUEST).send("Missing challenge or recipient DID")
        )
      );
    }
    const awardId = req.body.proof.challenge;

    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(UNAUTHORIZED).send("Missing OIDC token");
    }
    try {
      const OidcInfo = await axios.get(`${oidcIssuerUrl}/userinfo`, {
        headers: {
          Authorization: authHeader,
        },
        validateStatus: (status) => status === 200,
      });

      const OidcCompare = process.env.OIDC_COMPARE || "sub";
      const OidcId = OidcInfo.data[OidcCompare];

      const { verifyPresentation } = createVerifier([]);
      const didVerificationResult = await verifyPresentation({
        verifiablePresentation: req.body,
        issuerMembershipRegistry: {},
        options: { challenge: awardId },
      });

      if (!didVerificationResult.verified) {
        return res.status(UNAUTHORIZED).send(didVerificationResult);
      }

      return RecipientIssuance.findOne({
        where: { awardId },
        include: [
          Recipient,
          {
            model: Issuance,
            include: [{ model: Credential, include: [Group] }],
          },
        ],
      })
        .then(async (award) => {
          if (!award) {
            return res.status(NOT_FOUND).send();
          }
          if (
            OidcId !== award.recipient.externalId &&
            OidcId !== award.recipient.email
          ) {
            logger.warn(
              `Recipient mismatch: OIDC param "${OidcCompare}" was "${OidcId}", but recipient id is "${award.recipient.externalId} and email is "${award.recipient.email}"`
            );
            return res
              .status(UNAUTHORIZED)
              .send("Logged in user doesn't match credential recipient.");
          }
          award.recipient.did = req.body.holder;
          award.recipient.save();
          if (!award.isApproved) {
            return res
              .status(UNAUTHORIZED)
              .send(
                "Recipient has not completed requirements to receive this credential"
              );
          }
          if (!award.issuance.credential.group.didDoc) {
            return res
              .status(INTERNAL_SERVER_ERROR)
              .send("Issuing Group has not been configured with a key");
          }
          const templateVals = {
            ...award.issuance.credential.templateValues,
            AWARD_URL: `${process.env.PUBLIC_URL}/api/issuance/${award.issuance.id}`,
            ISSUER_DID: award.issuance.credential.group.didDoc.id,
            ISSUER_NAME: award.issuance.credential.group.name,
            DATE: award.issuance.issueDate.toISOString(),
            RECIPIENT_DID: req.body.holder,
            RECIPIENT_EMAIL: award.recipient.email,
            RECIPIENT_NAME: award.recipient.name,
            ISSUANCE_ID: award.issuance.id,
          };
          const templateReadable = await files.getFileAsReadable(
            award.issuance.credential.templatePath
          );
          const readableToString = (readable: Readable): Promise<string> => {
            return new Promise((resolve, reject) => {
              let data = "";
              readable.on("data", (chunk: string) => {
                data += chunk;
              });
              readable.on("end", () => {
                resolve(data);
              });
              readable.on("error", (err: Error) => {
                reject(err);
              });
            });
          };
          const template = parse(
            JSON.parse(await readableToString(templateReadable))
          );
          const populated = template(templateVals);
          const { sign } = createIssuer([
            award.issuance.credential.group.didDoc,
          ]);
          award.isIssued = true;
          award.issuedAt = new Date();
          return Promise.all([
            award.save(),
            sign(populated, {
              verificationMethod: award.issuance.credential.group.didKeyId,
            }),
          ])
            .then(([, signed]) => res.status(OK).json(signed))
            .catch((err) => {
              logger.error(err);
              return res.status(INTERNAL_SERVER_ERROR).send(err);
            });
        })
        .catch((err) => {
          logger.error(err);
          return res.status(INTERNAL_SERVER_ERROR).send(err);
        });
    } catch (err) {
      logger.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send(err);
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
