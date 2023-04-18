import cors from 'cors';
import express from 'express';
import {
	viewsRouter,
	consultingRouter,
	userRouter,
	visitorRouter
} from './routers/index.js';
const app = express();

// CORS 에러 방지
app.use(cors());

// Content-Type: application/json 형태의 데이터를 인식하고 핸들링할 수 있게 함.
app.use(express.json());

// Content-Type: application/x-www-form-urlencoded 형태의 데이터를 인식하고 핸들링할 수 있게 함.
app.use(express.urlencoded({ extended: false }));

// html, css, js 라우팅
app.use(viewsRouter);

app.use('/api', consultingRouter);
app.use('/api', userRouter);
app.use('/api', visitorRouter);

export { app };
