import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
export default function preventAuthForLoggedIn(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=preventAuthForLoggedIn.d.ts.map