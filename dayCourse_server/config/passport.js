//passport를 설정하고 JWT 인증 전략을 추가, 토큰 추출 및 검증
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const db = require('./db');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET, // 이 비밀키는 JWT 생성 및 검증에 사용됨
};

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            const sql = `
                SELECT User.id
                WHERE User.userId = ?
                `;
            const userId = jwt_payload.userId;

            db.query(sql, [userId], (err, result) => {
                if (err) {
                    return done(err, false);
                }
                if (result.length > 0) {
                    return done(null, result);
                } else {
                    return done(null, false);
                }
            });
        });
    );
};