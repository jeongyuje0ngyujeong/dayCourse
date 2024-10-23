// 네이버 검색 API 예제 - 블로그 검색
var express = require('express');
var axios = require('axios');
var app = express();

var client_id = 'mJquI2shJRRNjhQiXfrN';
var client_secret = 'YtFz32RaxB';


app.get('/search/local', async function (req, res) {
    const query = '광교';
    const encodedQuery = encodeURIComponent(query);
    const api_url = `https://openapi.naver.com/v1/search/local.json?query=${encodedQuery}`;

    try {
        const response = await axios.get(api_url, {
            headers: {
                'X-Naver-Client-Id': client_id,
                'X-Naver-Client-Secret': client_secret
            }
        });
        
        res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify(response.data));
    } catch (error) {
        res.status(error.response ? error.response.status : 500).end();
        console.log('error = ' + (error.response ? error.response.status : error.message));
    }
});

app.get('/search/local3', async function (req, res) {
    const query = '연신내';
    const encodedQuery = encodeURIComponent(query);
    const api_url = `https://openapi.naver.com/v1/search/local.json?query=${encodedQuery}`;

    try {
        const response = await axios.get(api_url, {
            headers: {
                'X-Naver-Client-Id': client_id,
                'X-Naver-Client-Secret': client_secret
            }
        });
        
        res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify(response.data));
    } catch (error) {
        res.status(error.response ? error.response.status : 500).end();
        console.log('error = ' + (error.response ? error.response.status : error.message));
    }
});

app.listen(80, function () => {
   console.log('http://127.0.0.1:80/search/local?query=검색어 app listening on port 80!!');
});
