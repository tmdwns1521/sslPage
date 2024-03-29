import { Router } from 'express';
import axios from 'axios';
import http from 'http';
import mysql from 'mysql2/promise';


const mysqlWrite = mysql.createPool({
    host: 'financical.sldb.iwinv.net',
    user: 'root',
    password: 'hHuF71CM4xs9',
    database: 'attendance_check',
    dateStrings: true,
		multipleStatements: true,
    connectTimeout: 5000,
    connectionLimit: 180 //default 10
})

const mysqlRead = mysql.createPool({
    host: 'financical.sldb.iwinv.net',
    user: 'root',
    password: 'hHuF71CM4xs9',
    database: 'attendance_check',
    dateStrings: true,
    connectTimeout: 5000,
    connectionLimit: 180 //default 10
})




// import { visitorService } from '../services/index.js';
// import bcrypt from 'bcrypt';

const visitorRouter = Router();

// 회원가입 api (아래는 /register이지만, 실제로는 /api/register로 요청해야 함.)
visitorRouter.post('/visitor', async (req, res, next) => {
	const today = new Date();
	const time_query = await mysqlRead.query('SELECT * FROM times');
	const { range1StartHour, range1StartMinute, range1EndHour, range1EndMinute, range2StartHour, range2StartMinute, range2EndHour, range2EndMinute} = time_query[0][0];

	let ment = 'no';

	const now = new Date();
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();

	// 첫 번째 범위 내에 있는지 확인
	const isInRange1 =
	  (currentHour > range1StartHour || (currentHour === range1StartHour && currentMinute >= range1StartMinute)) &&
	  (currentHour < range1EndHour || (currentHour === range1EndHour && currentMinute <= range1EndMinute));

	// 두 번째 범위 내에 있는지 확인
	const isInRange2 =
	  (currentHour > range2StartHour || (currentHour === range2StartHour && currentMinute >= range2StartMinute)) &&
	  (currentHour < range2EndHour || (currentHour === range2EndHour && currentMinute <= range2EndMinute));

	if (isInRange1) {
	  console.log("현재 시간은 첫 번째 범위 내에 있습니다.");
	} else if (isInRange2) {
	  console.log("현재 시간은 두 번째 범위 내에 있습니다.");
	} else {
	  return res.status(201).json({"result" : ment});
	}

	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	// const is_ip = await mysqlRead.query('SELECT * FROM attendance WHERE ip = ?', ip)
	// if (is_ip[0].length > 0) {
	// if (is_ip[0].length < 0) {
	// 	return res.status(201).json({"result" : false});
	// }else {
	try {
		const { team_name, employee_names, employee_nums, tels, reations, latitude, longitude, bank_name, bank_number, bank_admin } = req.body;
		let address_data;

		try {
			const address = await axios.get(`https://dapi.kakao.com/v2/local/geo/coord2address.json?input_coord=WGS84&x=${longitude}&y=${latitude}`, {
				headers : {
					"Authorization": "KakaoAK 838a3cef132ebc7e79bb9d570ab26d7b"
				}
			});
			address_data = (address?.data?.documents[0]?.address?.address_name);
		} catch (e) {
			address_data = '';
		}


		return res.status(201).json({"data" : {ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin }});
	} catch (error) {
		next(error);
	}
	// }
	return res.status(201).json({"result" : ment});
});

visitorRouter.post('/visitorOk', async (req, res, next) => {
	const {ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin} = req.body;
	

	// let ment = 'no';

	let ment;
	const today = new Date();

	// 날짜 부분을 원하는 형식으로 포맷
	const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

	// 시간 부분을 현재 시간으로 설정
	const formattedDateTime = `${formattedDate} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;

	console.log(formattedDateTime);
	const sql = "INSERT INTO attendance (ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin, createAT) values ?"
	await mysqlWrite.query(sql, [[[ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin, formattedDateTime]]])
	ment = '*정상적으로 처리되었습니다!';
	return res.status(201).json({"result": ment});
});

export { visitorRouter };