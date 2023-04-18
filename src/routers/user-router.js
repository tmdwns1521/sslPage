import { Router } from 'express';
import { userService } from '../services/index.js';
import bcrypt from 'bcrypt';

const userRouter = Router();

// 회원가입 api (아래는 /register이지만, 실제로는 /api/register로 요청해야 함.)
userRouter.post('/register', async (req, res, next) => {
	try {

		// req (request)의 body 에서 데이터 가져오기
		const fullName = req.body.fullName;
		const email = req.body.email;
		const password = req.body.password;

		// 위 데이터를 유저 db에 추가하기
		const newUser = await userService.addUser({
			fullName,
			email,
			password,
		});

		// 추가된 유저의 db 데이터를 프론트에 다시 보내줌
		// 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
		res.status(201).json(newUser);
	} catch (error) {
		next(error);
	}
});

// 로그인 api (아래는 /login 이지만, 실제로는 /api/login로 요청해야 함.)
userRouter.post('/login', async function (req, res, next) {
	try {

		// req (request) 에서 데이터 가져오기
		const email = req.body.id;
		const password = req.body.pw;

		// 로그인 진행 (로그인 성공 시 jwt 토큰을 프론트에 보내 줌)
		const userToken = await userService.getUserToken({ email, password });

		// jwt 토큰을 프론트에 보냄 (jwt 토큰은, 문자열임)
		res.status(200).json(userToken);
	} catch (error) {
		next(error);
	}
});

// 전체 유저 목록을 가져옴 (배열 형태임)
// 미들웨어로 loginRequired 를 썼음 (이로써, jwt 토큰이 없으면 사용 불가한 라우팅이 됨)
userRouter.get('/userlist', async function (req, res, next) {
	try {
		// 전체 사용자 목록을 얻음
		const users = await userService.getUsers();

		// 사용자 목록(배열)을 JSON 형태로 프론트에 보냄
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
});

// 사용자 데이터 수집
userRouter.get('/users', async function (req, res, next) {
	try {
		// content-type 을 application/json 로 프론트에서
		// 설정 안 하고 요청하면, body가 비어 있게 됨.
		let currentId = await req.currentUserId;
		const userData = await userService.getUserInfo(currentId);
		const { fullName, address, phoneNumber } = userData;
		let userInfo = {
			...(fullName && { fullName }),
			...(address && { address }),
			...(phoneNumber && { phoneNumber }),
		};
		res.status(201).json(userInfo);
		next();
	} catch (error) {
		next(error);
	}
});

// 사용자 정보 수정
// (예를 들어 /api/users/abc12345 로 요청하면 req.params.userId는 'abc12345' 문자열로 됨)
userRouter.patch('/update', async function (req, res, next) {
	try {
		// content-type 을 application/json 로 프론트에서
		// 설정 안 하고 요청하면, body가 비어 있게 됨.
		if (is.emptyObject(req.body)) {
			throw new Error(
				'headers의 Content-Type을 application/json으로 설정해주세요',
			);
		}

		// loign되었다면 id를 가져옴
		const userId = req.currentUserId;

		// body data 로부터 업데이트할 사용자 정보를 추출함.
		const fullName = req.body.fullName;
		const password = req.body.password;
		let address = req.body.address;
		if (
			address.postalCode == '' ||
			address.address1 == '' ||
			address.address2 == ''
		) {
			address = undefined;
		}
		const phoneNumber = req.body.phoneNumber;

		// 위 데이터가 undefined가 아니라면, 즉, 프론트에서 업데이트를 위해
		// 보내주었다면, 업데이트용 객체에 삽입함.
		const toUpdate = {
			...(fullName && { fullName }),
			...(password && { password }),
			...(address && { address }),
			...(phoneNumber && { phoneNumber }),
		};

		// 사용자 정보를 업데이트함.
		const updatedUserInfo = await userService.setUser(userId, toUpdate);

		// 업데이트 이후의 유저 데이터를 프론트에 보내 줌
		res.status(200).json(updatedUserInfo);
	} catch (error) {
		next(error);
	}
});

// 유저 삭제
userRouter.delete('/delete', async function (req, res, next) {
	try {
		// content-type 을 application/json 로 프론트에서
		// 설정 안 하고 요청하면, body가 비어 있게 됨.
		if (is.emptyObject(req.body)) {
			throw new Error(
				'headers의 Content-Type을 application/json으로 설정해주세요',
			);
		}
		const password = req.body.password;
		const userId = req.currentUserId;
		const user = await userService.getUserInfo(userId);
		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!isPasswordCorrect) {
			throw new Error(
				'비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.',
			);
		}

		await userService.deleteUser(userId);
		res.status(200).json({ status: 'ok' });
	} catch (error) {
		next(error);
	}
});

userRouter.get('/isadmin', async (req, res, next) => {
	// loign되었다면 id를 가져옴
	const userId = req.currentUserId;
	const user = await userService.getUserInfo(userId);
	const role = user.role;
	if (role !== 'admin') {
		res.status(200).json({ isCorrect: 'false' });
	} else {
		res.status(200).json({ isCorrect: 'ok' });
	}
});

userRouter.post('/reset-password', async (req, res, next) => {
	try {
		const { email } = req.body;
		const user = await userService.findByEmail(email);
		if (!user) {
			throw new Error('해당 메일로 가입된 사용자가 없습니다.');
		}

		// 랜덤 패스워드 생성하기
		const password = generateRandomPassword();

		const updatedUser = await userService.setUserByEmail(email, {
			password,
			// passwordReset
			passwordReset: true,
		});
		const from = process.env.NAVER_EMAIL_ID;
		// req.passwordReset = updatedUser.passwordReset;
		// console.log('뭐지?');
		// console.log(req.passwordReset);
		const html =
			"<div style='font-family: 'Apple SD Gothic Neo', 'sans-serif' !important; width: 540px; height: 600px; border-top: 4px solid #348fe2; margin: 100px auto; padding: 30px 0; box-sizing: border-box;'>" +
			"<h1 style='margin: 0; padding: 0 5px; font-size: 28px; font-weight: 400;'>" +
			"<span style='font-size: 15px; margin: 0 0 10px 3px;'>[StoreStore]</span><br />" +
			"<span style='color: #348fe2;'>변경된 비밀번호</span> 안내입니다." +
			'</h1>' +
			"<p style='font-size: 16px; line-height: 26px; margin-top: 50px; padding: 0 5px;'>" +
			'안녕하세요.<br />' +
			'비밀번호가 초기화되었습니다.<br />' +
			'변경된 비밀번호는 아래와 같습니다.<br />' +
			'감사합니다.' +
			'</p>' +
			"<p style='font-size: 16px; margin: 40px 5px 20px; line-height: 28px;'>" +
			'변경된 비밀번호: <br />' +
			"<span style='font-size: 24px;'>" +
			password +
			'</span>' +
			'</p>' +
			"<div style='border-top: 1px solid #DDD; padding: 5px;'>" +
			'</div>' +
			'</div>';
		// 패스워드 발송하기
		await sendMail(
			from,
			email,
			'[StoreStore] 비밀번호 변경 관련 메일 입니다.',
			`변경된 비밀번호는: ${password} 입니다.`,
			html,
		);
		res.status(200).json({ status: 'ok' });
	} catch (err) {
		next(err);
	}
});

export { userRouter };