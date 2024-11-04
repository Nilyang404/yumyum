import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (token == null) return res.sendStatus(401); // if no token, return 401 Unauthorized"

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // if token is invalid or expired, return 403 Forbidden
    req.user = user;
    next(); // always call next() so the next middleware can run
  });
};

export default authenticateToken;
