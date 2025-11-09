// middleware/preventAuthForLoggedIn.js
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
export default function preventAuthForLoggedIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (req.session && req.session.userId) {
        // If user already logged in, redirect to dashboard
        return res.redirect("/dashboard");
    }
    next();
}
