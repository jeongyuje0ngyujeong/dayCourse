const express = require('express');
const db = require('./db.js');
const apiHome = require('./routes/home.js');
const groupRoutes = require('./routes/group.js');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

const app = express();
dotenv.config();

//서버-클라이언트 연결 테스트
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 처리

//s3연결
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });
const s3 = new AWS.S3();
const bucketName = 'daycourseimage';

//파일 저장용
const fs = require('fs');
const path = require('path');

const multer = require('multer'); // 1. multer 추가 (파일 업로드 처리)
// 1. 메모리 스토리지 설정 (파일을 메모리에 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // 메모리 기반 저장소 사용
const authenticateJWT = require('./config/authenticateJWT');


// passport 초기화 및 설정
require('./config/passport')(passport);
app.use(passport.initialize());

// /home 경로에 있는 모든 라우트에 인증 미들웨어 적용
app.use('/home', authenticateJWT, apiHome);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use("/home", apiHome);
app.use("/group", groupRoutes);

// 이미지 목록을 가져오는 엔드포인트
app.get('/images', async (req, res) => {
  const userId = req.query.name;

  try {
    const params = { Bucket: bucketName, Prefix: `users/${userId}/` };

    // S3에서 객체 목록 가져오기
    s3.listObjects(params, (err, data) => {
      if (err) {
        console.error('Error retrieving images', err);
        return res.status(500).send('Error retrieving images');
      }

      // 이미지 URL을 반환하기 위해 S3 URL 생성
      const imageUrls = data.Contents.map(item => `https://${bucketName}.s3.amazonaws.com/${item.Key}`);

      // 이미지 URL 목록을 JSON 형식으로 전송
      console.log("전달");
      console.log(imageUrls);
      res.json(imageUrls);
    });
  } catch (err) {
    console.error('Error retrieving images', err);
    res.status(500).send('Error retrieving images');
  }
});

app.post('/images', upload.single('image'), async (req, res) => {
  try {
    console.log("사진등록");
    console.log(req.body);
    const userId = req.body;

    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const file = req.file;
    const imgNAME = path.basename(file.originalname);

    // S3에서 객체 목록 가져오기
    var uploadParams = {
      Bucket: bucketName,
      Key: `users/${userId}/${imgNAME}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    // call S3 to retrieve upload
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      }
      if (data) {
        console.log("Upload Success", data.Location);
      }
    });
  } catch (err) {
    console.error('Error retrieving images', err);
    res.status(500).send('Error retrieving images');
  }
});

app.get('/', (req, res) => {
  res.send('테스트')
})



const axios = require('axios');
const FormData = require('form-data');

app.get('/123/456', async (req, res) => {
  const userId = 404;

  console.log("테스트 시작")

  try {
    const params = { Bucket: bucketName, Prefix: `users/${userId}/` };

    // S3에서 객체 목록 가져오기 (await와 Promise 사용하여 비동기 처리)
    const data = await s3.listObjectsV2(params).promise();

    if (!data.Contents || data.Contents.length === 0) {
      return res.status(404).send('No images found');
    }

    const imagesData = [];

    console.log("s3 시작")

    //해당 리스트들의 키 조회하여 메타데이터 가져옴.
    for (const item of data.Contents) {
      const imageUrl = `https://${bucketName}.s3.amazonaws.com/${item.Key}`;

      // 객체의 메타데이터 가져오기
      const metadata = await s3.headObject({ Bucket: bucketName, Key: item.Key }).promise();

      //메타데이터 태그값만 남기기.
      const newMetadata = Object.values(metadata.Metadata);

      // URL과 메타데이터를 배열에 저장
      imagesData.push({
        url: imageUrl,
        metadata: newMetadata
      });
    }

    console.log("이미지 분석")

    // Axios 요청을 통해 이미지 분석
    const form = new FormData();
    form.append('metadata', JSON.stringify(imagesData));

    const response = await axios.post('http://13.124.135.96:5000/tt', form, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(response.data)

    // 이미지 URL과 메타데이터를 함께 응답으로 전송
    res.json(response.data);

  } catch (err) {
    console.error('Error retrieving images', err);
    res.status(500).send('Error retrieving images');
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});