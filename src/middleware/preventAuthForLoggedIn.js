// middleware/preventAuthForLoggedIn.js
export default function preventAuthForLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
        // If user already logged in, redirect to dashboard
        return res.redirect("/dashboard");
    }
    next();
}
