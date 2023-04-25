import { Router } from 'express';
import axios from 'axios';
import http from 'http';

// import { visitorService } from '../services/index.js';
// import bcrypt from 'bcrypt';

const visitorRouter = Router();

// 회원가입 api (아래는 /register이지만, 실제로는 /api/register로 요청해야 함.)
visitorRouter.post('/visitor', async (req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	try {
		const { team_name, employee_names, employee_nums, tels, reations, latitude, longitude, bank_name, bank_number, bank_admin } = req.body;

		console.log(latitude);
		console.log(longitude);
		const address = await axios.get(`https://dapi.kakao.com/v2/local/geo/coord2address.json?input_coord=WGS84&x=${longitude}&y=${latitude}`, {
			headers : {
				"Authorization": "KakaoAK 838a3cef132ebc7e79bb9d570ab26d7b"
			}
		});
		console.log(address.data);
		const address_data = (address.data.documents[0].road_address.address_name);

		res.status(201).json({ip, address_data, team_name, employee_names, employee_nums, tels, reations, bank_name, bank_number, bank_admin });
	} catch (error) {
		next(error);
	}
});

export { visitorRouter };