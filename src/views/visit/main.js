import * as Api from '/api.js';

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
const temass = document.getElementsByName('name')
let team_name = '';
teamo.addEventListener("change", (e) => {
	team_name = e.target.value;
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
		longitude
	}
	const postData = await Api.post('http://localhost:80/api/visitor', data);
	alert(postData.ip);
})


