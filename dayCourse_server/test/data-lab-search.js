var axios = require('axios');
var app = require('express');
var client_id = 'mJquI2shJRRNjhQiXfrN';
var client_secret = 'YtFz32RaxB';
var api_url = 'https://openapi.naver.com/v1/datalab/search';


var request_body = {
    "startDate": "2023-10-19",
    "endDate": "2024-10-18",
    "timeUnit": "month",
    "keywordGroups": [
        {
            "groupName": "추천 장소",
            "keywords": [
                "광교",
                "식당"
            ]
        },
    ],
};

request.post({
        url: api_url,
        body: JSON.stringify(request_body),
        headers: {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret,
            'Content-Type': 'application/json'
        }
    },

    function (error, response, body) {
        console.log(response.statusCode);
        console.log(body);
    }
);