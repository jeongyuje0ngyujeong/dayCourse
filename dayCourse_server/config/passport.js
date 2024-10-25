//passport를 설정하고 JWT 인증 전략을 추가, 토큰 추출 및 검증
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
// const User = require('../models/user');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET, // 이 비밀키는 JWT 생성 및 검증에 사용됨
};

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);  // 사용자 인증 성공
                } else {
                    return done(null, false); // 인증 실패
                }
            } catch (err) {
                return done(err, false);
            }
        })
    );
};