import "./LoadEnv";
import path from "path";
import logger from "./shared/Logger";

const getEnvVarOrDefault = (envVar: string, defaultValue: string) => {
  const result = process.env[envVar] || defaultValue;
  if (!process.env[envVar]) {
    logger.warn(`${envVar} not set, using default: "${defaultValue}"`);
  }
  return result;
};

const getEnvVarOrNull = (envVar: string) => {
  const result = process.env[envVar];
  if (!!result) {
    return result;
  } else {
    logger.warn(`${envVar} not set, using null`);
    return null;
  }
};

const getEnvVarOrExitError = (envVar: string) => {
  const result = process.env[envVar];
  if (!!result) {
    return result;
  } else {
    logger.error(`${envVar} not set.`);
    process.exit(1);
  }
};

const config = {
  /* Set default values assuming NODE_ENV === production */
  port: getEnvVarOrDefault("PORT", "3000"),
  jwtSecret: getEnvVarOrDefault("CA_JWT_SECRET", "secret"),
  logLevel: getEnvVarOrDefault("LOG_LEVEL", "info"),
  trustProxy: getEnvVarOrDefault("TRUST_PROXY", "loopback"),
  dbConnectionUrl: getEnvVarOrExitError("CA_DB_CONNECTION_URL"),
  oidc: {
    compare: getEnvVarOrDefault("OIDC_COMPARE", "sub"),
    issuerUrl: getEnvVarOrExitError("OIDC_ISSUER_URL"),
    userinfoPath: getEnvVarOrDefault("OIDC_USERINFO_PATH", "/userinfo"),
  },
  publicUrl: getEnvVarOrExitError("PUBLIC_URL"),
  templateUrl: getEnvVarOrDefault(
    "TEMPLATE_URL",
    `local://${path.join(__dirname, "..", "templates")}`
  ),
};

if (process.env.NODE_ENV === "development") {
  config.logLevel = "debug";
}

if (process.env.NODE_ENV === "test") {
  config.logLevel = "error";
}

export default config;
