import { Router } from 'express';
import axios from 'axios';
import http from 'http';
import mysql from 'mysql2/promise';


const mysqlWrite = mysql.createPool({
    host: 'financialral.sldb.iwinv.net',
    user: 'root',
    password: '3QYdhT5B71qv',
    database: 'database',
    dateStrings: true,
	multipleStatements: true,
    connectTimeout: 5000,
    connectionLimit: 180 //default 10
})

const mysqlRead = mysql.createPool({
    host: 'financialral.sldb.iwinv.net',
    user: 'root',
    password: '3QYdhT5B71qv',
    database: 'database',
    dateStrings: true,
    connectTimeout: 5000,
    connectionLimit: 180 //default 10
})




// import { visitorService } from '../services/index.js';
// import bcrypt from 'bcrypt';

const visitorRouter = Router();

// 회원가입 api (아래는 /register이지만, 실제로는 /api/register로 요청해야 함.)
visitorRouter.post('/visitor', async (req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	const is_ip = await mysqlRead.query('SELECT * FROM attendance WHERE ip = ?', ip)
	if (is_ip[0].length > 0) {
		return res.status(201).json({"result" : false});
	}else {
		try {
			const { team_name, employee_names, employee_nums, tels, reations, latitude, longitude, bank_name, bank_number, bank_admin } = req.body;
	
			const address = await axios.get(`https://dapi.kakao.com/v2/local/geo/coord2address.json?input_coord=WGS84&x=${longitude}&y=${latitude}`, {
				headers : {
					"Authorization": "KakaoAK 838a3cef132ebc7e79bb9d570ab26d7b"
				}
			});
			const address_data = (address.data.documents[0].address.address_name);
	
			const sql = "INSERT INTO attendance (ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin) values ?"
			await mysqlWrite.query(sql, [[[ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin]]])
			return res.status(201).json({"result" : {ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin }});
		} catch (error) {
			next(error);
		}
	}
});

export { visitorRouter };