const ok1 = document.getElementById('ok1')

ok1.addEventListener("click", (e) => {
	e.preventDefault;
	const check1 = document.getElementById('check1')
	check1.style.display = "none";
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
