const passport = require('passport');
const redisClient = require('../config/redisClient');  // 최신 redis 버전은 자동으로 promise 지원
const dotenv = require('dotenv');

dotenv.config();

const authenticateJWT = async (req, res, next) => {
  // console.log("Request Headers:", JSON.stringify(req.headers, null, 2));
  // console.log('헤더에 담긴 token:', req.headers.authorization);
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.json({ success: false });
  }

  try {
      const blacklisted = await redisClient.get(token);
      if (blacklisted) {
          return res.status(401).json({ error: 'Unauthorized: Token is blacklisted' });
      }

      // Passport를 이용한 JWT 인증
      passport.authenticate('jwt', { session: false }, (err, user) => {
          if (err) {
              console.error('Passport error:', err);
              return res.status(500).json({ error: 'Server error' });
          }
          if (!user) {
              return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
          }

          req.user = user;

          // 다음 미들웨어로 진행
          next();
      })(req, res, next);

  } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Authorization error' });
  }
};

module.exports = authenticateJWT;
