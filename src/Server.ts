import bcrypt from "bcrypt";
import morgan from "morgan";
import passport from "passport";
import helmet from "helmet";

import * as swagger from "swagger-express-typescript";
import { SwaggerDefinitionConstant } from "swagger-express-typescript";
import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "express-async-errors";

import config from "./config";

// initialize sequelize before pulling in any models
import "./sequelize";
import { User } from "@models/User";
import { Group } from "@models/Group";
import BaseRouter from "./routes";
import logger from "@shared/Logger";
import "./apimodels";

import type { NextFunction } from "express";

const app = express();

/*************
 * Set basic express settings
 *************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

// Add APIs
app.use("/api", BaseRouter);

// Auth
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};
passport.use(
  new JwtStrategy(jwtOpts, (jwtPayload, done) => {
    if (!jwtPayload.name || !jwtPayload.apiToken) {
      return done(null, false);
    }
    return User.findOne({
      where: { name: jwtPayload.name },
      include: [{ model: Group, attributes: ["id", "name"] }],
    })
      .then((user) => {
        if (!user) {
          return done(null, false);
        }
        return bcrypt
          .compare(jwtPayload.apiToken, user.get("apiToken") as string)
          .then((res: boolean) =>
            res ? done(null, user.toJSON()) : done(null, false)
          );
      })
      .catch((err) => done(err, false));
  })
);

app.use(passport.initialize());

// Add Swagger
app.use(
  swagger.express({
    definition: {
      info: {
        title: "cred-admin api",
        version: "1.0",
      },
      schemes: ["https"],
      securityDefinitions: {
        apiKeyHeader: {
          type: SwaggerDefinitionConstant.Security.Type.API_KEY,
          in: SwaggerDefinitionConstant.Security.In.HEADER,
          name: "Authorization",
        },
      },
    },
  })
);

app.use("/api-docs/swagger", express.static(`${__dirname}/swagger`));
app.use(
  "/api-docs/swagger/assets",
  express.static("node_modules/swagger-ui-dist")
);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err);
  res.status(StatusCodes.BAD_REQUEST).json({
    error: err.message,
  });
  next(err);
});

// Export express instance
export default app;
