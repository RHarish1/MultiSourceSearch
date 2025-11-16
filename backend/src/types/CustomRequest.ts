import { Request } from "express";
import { Session, SessionData } from "express-session";

export interface AuthenticatedRequest extends Request {
    session: Session & Partial<SessionData> & { userId?: string };
}
