import { Router } from 'express';
import axios from 'axios';
import http from 'http';
import mysql from 'mysql2';

const conn = {  // mysql 접속 설정
    host: 'financialral.sldb.iwinv.net',
    port: '3306',
    user: 'root',
    password: '3QYdhT5B71qv',
    database: 'database'
};

let connection = mysql.createConnection(conn); // DB 커넥션 생성
connection.connect();   // DB 접속


// import { visitorService } from '../services/index.js';
// import bcrypt from 'bcrypt';

const visitorRouter = Router();

// 회원가입 api (아래는 /register이지만, 실제로는 /api/register로 요청해야 함.)
visitorRouter.post('/visitor', async (req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	try {
		const { team_name, employee_names, employee_nums, tels, reations, latitude, longitude, bank_name, bank_number, bank_admin } = req.body;

		const address = await axios.get(`https://dapi.kakao.com/v2/local/geo/coord2address.json?input_coord=WGS84&x=${longitude}&y=${latitude}`, {
			headers : {
				"Authorization": "KakaoAK 838a3cef132ebc7e79bb9d570ab26d7b"
			}
		});
		if (bank_name === '') {
			let bank_name = ' ';
			let bank_number = ' ';
			let bank_admin =' ';
		}
		const address_data = (address.data.documents[0].address.address_name);

		let sql = `INSERT INTO 'attendance' ('ip', 'address_data', 'team_name', 'employee_names', 'employee_nums', 'tels', 'reations', 'bank_name', 'bank_number', 'bank_admin') VALUES (${ip}, ${address_data}, ${team_name}, ${employee_names}, ${employee_nums}, ${tels}, ${reations}, ${bank_name}, ${bank_number}, ${bank_admin});`;

		console.log(sql);
		connection.query(sql, function (err, results, fields) {
			if (err) {
				console.log(err);
			}
			console.log(results);
		});

		res.status(201).json({ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin });
	} catch (error) {
		next(error);
	}
});

export { visitorRouter };