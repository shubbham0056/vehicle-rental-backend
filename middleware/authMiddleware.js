const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "No token provided" });

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

const vendorMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== "vendor") return res.status(403).json({ msg: "Vendor access only" });
    next();
  });
};

module.exports = { authMiddleware, vendorMiddleware };
