const passport = require('passport');
const redis = require('redis');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

// JWT 인증 미들웨어 함수
const authenticateJWT = async (req, res, next) => {
  // console.log("Request Headers:", JSON.stringify(req.headers, null, 2));
  // console.log('헤더에 담긴 token:', req.headers.authorization);
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.json({ result: 'failure', message: '다시 로그인 해주세요.' });
  }
  //blacklisted에 관련해서 예외처리
  try {
    // Redis 블랙리스트 확인
    const blacklisted = await getAsync(token);
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

        // 인증 성공 시 사용자 정보를 req.user에 설정
        req.user = user;
        next();
    })(req, res, next);
  } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Authorization error' });
  }
};

module.exports = authenticateJWT;
