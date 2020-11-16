import { Router } from "express";
import { RecipientsRouter } from "./Recipients";
import { CredentialsRouter } from "./Credentials";

// Init router and path
const router = Router();

// Add sub-routes
router.use("/recipients", new RecipientsRouter().getRouter());
router.use("/credentials", new CredentialsRouter().getRouter());

// Export the base-router
export default router;
