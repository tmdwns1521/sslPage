import * as Api from '/api.js';

const bank = document.getElementById('bank');
bank.style.display = 'none';

const ok1 = document.getElementById('ok1')

let latitude = '';
let longitude = '';
let team = '';

function success({ coords, timestamp }) {
	latitude = coords.latitude;   // 위도
	longitude = coords.longitude; // 경도
}

function error() {
	alert('미동의시 출석체크를 할수 없습니다.');
	location.reload()
  }

function getUserLocation() {
	if (!navigator.geolocation) {
		throw "위치 정보가 지원되지 않습니다.";
	}
	navigator.geolocation.getCurrentPosition(success, error);
}


ok1.addEventListener("click", (e) => {
	e.preventDefault;
	const check1 = document.getElementById('check1')
	check1.style.display = "none";
	getUserLocation();
	const check2 = document.getElementById('check2')
	check2.style.display = "block";
})

const no1 = document.getElementById('no1')

no1.addEventListener("click", (e) => {
	e.preventDefault;
	alert('출석체크를 위해 동의가 필요합니다.')
})

const no2 = document.getElementById('no2')

no2.addEventListener("click", (e) => {
	e.preventDefault;
	alert('출석체크를 위해 확인이 필요합니다.')
})

const ok2 = document.getElementById('ok2')

ok2.addEventListener("click", (e) => {
	e.preventDefault;
	const check1 = document.getElementById('check2')
	check1.style.display = "none";
	const check2 = document.getElementById('check3')
	check2.style.display = "block";
})

const submit_button = document.getElementById('submit_button')

const employee_name = document.getElementById('employee_name');
const employee_num = document.getElementById('employee_num');
const tel = document.getElementById('tel');


const teamo = document.getElementById('team');
const temass = document.getElementsByName('name');
let team_name = '';
teamo.addEventListener("change", (e) => {
	team_name = e.target.value;
	if (e.target.value === '수협중앙회지부') {
		bank.style.display = 'block';
	} else {
		bank.style.display = 'none';
	}
});

let reations = ''

const me = document.getElementById('me');
const family = document.getElementById('family');

me.addEventListener("click", (e) => {
	e.preventDefault;
	reations = me.value;
});

family.addEventListener("click", (e) => {
	e.preventDefault;
	reations = family.value;
});


submit_button.addEventListener("click", async (e) => {
	e.preventDefault;
	const employee_names = employee_name.value;
	const employee_nums = employee_num.value;
	const tels = tel.value;
	const bank_name = document.getElementById('bank_name')
	const bank_number = document.getElementById('bank_number')
	const bank_admin = document.getElementById('bank_admin')
	if (team_name === "") {
		alert('소속을 선택해주세요!')
		return false;
	}
	if (employee_names === '') {
		alert('성명을 작성해주세요!')
		return false;
	}
	if (employee_nums === '') {
		alert('직원번호을 작성해주세요!')
		return false;
	}
	if (tels === '') {
		alert('핸드폰번호를 작성해주세요!')
		return false;
	}
	if (reations === '') {
		alert('본인 유무를 확인해주세요!')
		return false;
	}
	const data = {
		team_name,
		employee_names,
		employee_nums,
		tels,
		reations,
		latitude,
		longitude,
		bank_name,
		bank_number,
		bank_admin
	}
	const postData = await Api.post('https://www.financialrally.pe.kr/api/visitor', data);
	// const postData = await Api.post('http://localhost:80/api/visitor', data);
	const tn = postData.team_name;
	const en = postData.employee_names;
	const enm = postData.employee_nums;
	const t = postData.tels;
	const rl = postData.reations;
	const bn = postData.bank_name;
	const bnb = postData.bank_number;
	const ba = postData.bank_admin;
	const {ip, address_data } = postData
	alert("*5.1절 노동절 금융노조 집회참석이 정상적으로 등록되었습니다!")
	if (bn === ''){
		alert(address_data + "\n" + en + "\n" + enm + "\n" + t + "\n" + tn + "\n" + rl + "\n" + ip);
	} else {
		alert(address_data + "\n" + en + "\n" + enm + "\n" + t + "\n" + tn + "\n" + rl + "\n" + ip + "\n" + bn + "\n" + bnb + "\n" + ba);
	}
	location.reload()
})


