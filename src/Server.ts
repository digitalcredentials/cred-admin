import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "passport";
import sequelize from "./sequelize";
import helmet from "helmet";

import * as swagger from "swagger-express-typescript";
import { SwaggerDefinitionConstant } from "swagger-express-typescript";
import express, { Request, Response } from "express";
import { BAD_REQUEST } from "http-status-codes";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "express-async-errors";

import BaseRouter from "./routes";
import logger from "@shared/Logger";

const app = express();

/*************
 * Set basic express settings
 *************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
  secretOrKey: process.env.CA_JWT_SECRET || "secret",
};
passport.use(
  new JwtStrategy(jwtOpts, (jwtPayload, done) =>
    sequelize.models.User.findOne({ where: { apiToken: jwtPayload } })
      .then((user) => (user ? done(null, user) : done(null, false)))
      .catch((err) => done(err, false))
  )
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
      // Models can be defined here
    },
  })
);

app.use("/api-docs/swagger", express.static(`${__dirname}/swagger`));
app.use(
  "/api-docs/swagger/assets",
  express.static("node_modules/swagger-ui-dist")
);

// Print API errors
app.use((err: Error, req: Request, res: Response) => {
  logger.error(err.message, err);
  return res.status(BAD_REQUEST).json({
    error: err.message,
  });
});

// Export express instance
export default app;
