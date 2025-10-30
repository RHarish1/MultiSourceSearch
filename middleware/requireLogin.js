// middleware/requireLogin.js
export default function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect("/index");
    }
    next();
}
