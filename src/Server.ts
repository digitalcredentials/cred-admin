import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "passport";
import sequelize from "./sequelize";
import helmet from "helmet";
import "reflect-metadata";

import { Container } from "inversify";
import {
  interfaces,
  InversifyExpressServer,
  TYPE,
} from "inversify-express-utils";
import { VersionController } from "./controllers/version.controller";
import * as swagger from "swagger-express-typescript";
// import { SwaggerDefinitionConstant } from "swagger-express-typescript";
import express, { Request, Response } from "express";
import { BAD_REQUEST } from "http-status-codes";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "express-async-errors";

// import BaseRouter from './routes';
import logger from "@shared/Logger";

const container = new Container();

container
  .bind<interfaces.Controller>(TYPE.Controller)
  .to(VersionController)
  .inSingletonScope()
  .whenTargetNamed(VersionController.TARGET_NAME);

const server = new InversifyExpressServer(container);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
server.setConfig((exprapp: any) => {
  /*************
   * Set basic express settings
   *************/

  exprapp.use(express.json());
  exprapp.use(express.urlencoded({ extended: true }));
  exprapp.use(cookieParser());

  // Show routes called in console during development
  if (process.env.NODE_ENV === "development") {
    exprapp.use(morgan("dev"));
  }

  // Security
  if (process.env.NODE_ENV === "production") {
    exprapp.use(helmet());
  }

  // Auth
  const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.CA_JWT_SECRET || "secret",
  };
  passport.use(
    new JwtStrategy(jwtOpts, (jwtPayload, done) =>
      sequelize.models.User.findOne({ where: { apiToken: jwtPayload.sub } })
        .then((user) => (user ? done(null, user) : done(null, false)))
        .catch((err) => done(err, false))
    )
  );

  exprapp.use(passport.initialize());

  // Add Swagger
  exprapp.use(
    swagger.express({
      definition: {
        info: {
          title: "cred-admin api",
          version: "1.0",
        },
        externalDocs: {
          url: process.env.CA_URL || "http://localhost:3000",
        },
        // Models can be defined here
      },
    })
  );

  exprapp.use("/api-docs/swagger", express.static(`${__dirname}/swagger`));
  exprapp.use(
    "/api-docs/swagger/assets",
    express.static("node_modules/swagger-ui-dist")
  );
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
server.setErrorConfig((exprapp: any) => {
  // Print API errors
  exprapp.use((err: Error, req: Request, res: Response) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message,
    });
  });
});

const app = server.build();

// Export express instance
export default app;
