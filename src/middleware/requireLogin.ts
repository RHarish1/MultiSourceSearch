// middleware/requireLogin.js
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
export default function requireLogin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.session || !req.session.userId) {
        return res.redirect("/index");
    }
    next();
}
