// middleware/requireLogin.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/CustomRequest.js";

export default function requireLogin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    if (!req.session || !req.session.userId) {
        res.status(401).json({ error: "Unauthorized: login required" });
    }
    else {
        res.status(200).json({ message: "User is logged in" });
    }
    return next();
}
