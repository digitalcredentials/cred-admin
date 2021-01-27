import { Router } from "express";
import { RecipientsRouter } from "./Recipients";
import { CredentialsRouter } from "./Credentials";
import { IssuancesRouter } from "./Issuances";
import { GroupRouter } from "./Groups";
import { EnrollRouter } from "./Enroll";
import { UsersRouter } from "./Users";

// Init router and path
const router = Router();

// Add sub-routes
router.use("/recipients", new RecipientsRouter().getRouter());
router.use("/credentials", new CredentialsRouter().getRouter());
router.use("/issuances", new IssuancesRouter().getRouter());
router.use("/groups", new GroupRouter().getRouter());
router.use("/enroll", new EnrollRouter().getRouter());
router.use("/users", new UsersRouter().getRouter());

// Export the base-router
export default router;
