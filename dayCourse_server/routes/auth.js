const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();

router.post('/register/check', async (req, res) => {
    const { username } = req.body;
        
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ result: 'failure', message: '이미 존재하는 아이디입니다.' });
        }
        return res.json({ result: 'success'});

    } catch (error) {
        res.status(500).json({ result: 'failure', message: '서버 오류 발생' });
    }
});

// 회원가입
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const newUser = new User({ 
            username, 
            password
        });

        await newUser.save();
        // console.log('찍히니');
        return res.json({ result: 'success', message: '회원가입 성공!'});

    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ result: 'failure', message: '서버 오류 발생' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 사용자 확인
        const user = await User.findOne({ username });

        // id가 존재하지 않을 때
        if (!user) {
            return res.json({ result: 'failure', message: '존재하지 않는 아이디입니다.' });
        }
        // 비밀번호 확인        
        const isMatch = await user.comparePassword(password);

        // 비밀번호가 존재하지 않을 때
        if (!isMatch) {
            return res.json({ result: 'failure', message: '비밀번호가 틀렸습니다. 다시 입력해 주세요' });
        }

        // JWT 생성
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // 로그인 성공 - 토큰 반환
        return res.json({ 
            result: 'success',
            access_token: token,
            userId:user._id
        });

    } catch (error) {
        res.status(500).json({ result: 'failure', message: '서버 오류 발생' });
    }
});

// 사용자 정보 조회 라우터 (JWT 인증 필요)
router.get('/user/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ result: 'failure', message: '사용자를 찾을 수 없습니다.' });
        }

        if (user.posts && user.posts.length > 0) {
            // DB에 저장된 순서의 역순으로 posts를 정렬
            user.posts.reverse();
        }
        
        console.log(user.posts);

        // posts 배열을 createdAt 필드 기준으로 최신순으로 정렬
        // user.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // if (user.posts && user.posts.length > 0) {
        //     user.posts = user.posts.filter(post => post.createdAt)  // createdAt이 있는 게시물만
        //                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // }


        // 사용자 데이터 반환
        res.json({ result: 'success', user });

    } catch (error) {
        res.status(500).json({ result: 'failure', message: '서버 오류 발생' });
    }
});

module.exports = router;