const jwt = require("jsonwebtoken");
const blacklist = require("./blacklist");

module.exports = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; 
    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    if (blacklist.check(token)) {
        return res.status(401).json({ error: "Token inválido (Logout realizado)" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (err) {
        res.status(401).json({ error: "Token inválido ou expirado" });
    }
};