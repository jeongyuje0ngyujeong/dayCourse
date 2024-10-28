const passport = require('passport');
const redis = require('redis');

// JWT 인증 미들웨어 함수
const authenticateJWT = (req, res, next) => {
  // console.log("Request Headers:", JSON.stringify(req.headers, null, 2));
  // console.log('헤더에 담긴 token:', req.headers.authorization);
  const token = req.headers.["authorization"]?.split(" ")[1];

  if (!token) {
    return.res.status(401).json({ error: 'No token provided' });
  }

  const blacklisted = await getAsync(token);
  if (blacklisted) {
    return res.json({ result: 'failure', message: '다시 로그인 해주세요.' });
  }

  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Passport error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!user) {
      // 토큰이 유효하지 않거나 만료된 경우
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // console.log("req.user:", JSON.stringify(user, null, 2));

    // 인증 성공 시 req.user에 사용자 정보 설정
    req.user = user;
    next(); // 다음 미들웨어로 이동
    
  })(req, res, next);
};

module.exports = authenticateJWT;
