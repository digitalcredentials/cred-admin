import { Router } from "express";
import { RecipientsRouter } from "./Recipients";

// Init router and path
const router = Router();

// Add sub-routes
router.use("/recipients", new RecipientsRouter().getRouter());

// Export the base-router
export default router;
