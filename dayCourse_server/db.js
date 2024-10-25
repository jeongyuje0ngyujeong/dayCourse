const mysql = require('mysql2');


const db = mysql.createConnection({
    host: '13.124.161.75',
    user: 'daycourse',
    password: 'Gowh241017*',
    database: 'daycourse'
});

db.connect();
console.log('db 연결')

module.exports = db;