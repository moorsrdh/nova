const missions = [
	{ title: 'The Moon', subtitle: 'Meet our closest neighbor', icon: '🌙', tone: 'moon', duration: '4 min', guide: 'First stop: the Moon! It is our closest space neighbor. Let’s find out what makes it glow.', fact: 'The Moon is Earth’s only natural satellite. It does not make its own light; it reflects sunlight back to us.', question: 'What makes the Moon look bright at night?', answers: ['It reflects light from the Sun', 'It makes its own sunshine', 'It is made of glowing stars'], correct: 0 },
	{ title: 'Our Solar System', subtitle: 'Say hello to the planets', icon: '🪐', tone: 'sun', duration: '5 min', guide: 'Great exploring! Next, we’re visiting the Sun and its eight planets. I’ll help you meet our whole solar family.', fact: 'Our solar system has eight planets. They all travel around the Sun, which is a star at the center.', question: 'What do all the planets in our solar system orbit?', answers: ['The Moon', 'The Sun', 'Earth'], correct: 1 },
	{ title: 'Planet Earth', subtitle: 'A very special blue world', icon: '🌍', tone: 'earth', duration: '4 min', guide: 'Now let’s look back at home. Earth is a pretty remarkable place, and I have a clue about its big blue oceans.', fact: 'Earth is the only world we know of with life. Liquid water covers about 71 percent of its surface.', question: 'What covers most of Earth’s surface?', answers: ['Sand', 'Liquid water', 'Ice'], correct: 1 },
	{ title: 'Rocket Science', subtitle: 'How astronauts travel', icon: '🚀', tone: 'rocket', duration: '6 min', guide: 'Ready to leave Earth? Our next stop is rocket science. Let’s discover how a rocket lifts us into space.', fact: 'A rocket pushes hot gas downward. That push sends the rocket upward, all the way beyond Earth’s atmosphere.', question: 'Which way does a rocket push gas to travel upward?', answers: ['Downward', 'Sideways', 'Upward'], correct: 0 },
	{ title: 'Galaxies', subtitle: 'A universe of star cities', icon: '🌌', tone: 'galaxy', duration: '5 min', guide: 'One last big trip: galaxies! We’ll zoom out to see the enormous star city our Sun calls home.', fact: 'A galaxy is a huge group of stars, gas, and dust held together by gravity. Our Sun lives in the Milky Way galaxy.', question: 'What is a galaxy?', answers: ['A single planet', 'A group of stars, gas, and dust', 'A kind of rocket'], correct: 1 }
];

const prizes = [
	{ id: 'rocket', title: 'Rocket explorer', icon: '🚀', cost: 3, detail: 'A shiny rocket badge for your collection.' },
	{ id: 'moon', title: 'Moon walker', icon: '🌙', cost: 6, detail: 'A lunar badge for brave explorers.' },
	{ id: 'star', title: 'Stardust champion', icon: '✨', cost: 9, detail: 'The brightest badge in the galaxy.' }
];

const storageKey = 'nova-learning-galaxy-v1';
const defaultState = { name: '', email: '', stars: 0, completed: [], claimed: [], sound: false };
let state = loadState();
let toastTimer;
let activeMission = 0;

function loadState() {
	try {
		const saved = JSON.parse(localStorage.getItem(storageKey));
		return saved ? { ...defaultState, ...saved } : { ...defaultState };
	} catch {
		return { ...defaultState };
	}
}

function saveState() {
	localStorage.setItem(storageKey, JSON.stringify(state));
}

function render() {
	document.querySelector('#star-count').textContent = state.stars;
	document.querySelector('#progress-number').innerHTML = `${state.completed.length}<span>/5</span>`;
	document.querySelector('#progress-bar').style.width = `${state.completed.length / missions.length * 100}%`;
	document.querySelector('#progress-note').textContent = state.completed.length === missions.length ? 'Galaxy explorer status: achieved!' : state.completed.length ? 'Your galaxy is getting bigger.' : 'Every great explorer starts somewhere.';
	document.querySelector('#streak-copy').textContent = state.completed.length ? 'Your curiosity is glowing' : 'Your journey starts today';
	document.querySelector('#profile-name').textContent = state.name || 'Space explorer';
	document.querySelector('#profile-status').textContent = state.name ? 'Journey saved on this device' : 'Save your journey';
	document.querySelector('#profile-avatar').textContent = state.name ? state.name.charAt(0).toUpperCase() : 'N';
	document.querySelector('#login-button').innerHTML = state.name ? 'My profile <span aria-hidden="true">↗</span>' : 'Log in <span aria-hidden="true">↗</span>';
	document.querySelector('#sound-icon').textContent = state.sound ? '♫' : '♪';
	const nextMission = Math.min(state.completed.length, missions.length - 1);
	const allDone = state.completed.length === missions.length;
	const guideCopy = allDone ? 'We made it through the whole galaxy! I’m so glad we explored together. Pick any stop for another visit.' : missions[nextMission].guide;
	document.querySelector('#guide-copy').textContent = state.name ? `${state.name}, ${guideCopy.charAt(0).toLowerCase()}${guideCopy.slice(1)}` : guideCopy;
	document.querySelector('#guide-next').innerHTML = `${allDone ? 'Explore again' : `Go to ${missions[nextMission].title}`} <span aria-hidden="true">→</span>`;
	document.querySelector('#guide-next').dataset.mission = allDone ? '0' : String(nextMission);
	document.querySelector('#level-list').innerHTML = missions.map((mission, index) => {
		const done = state.completed.includes(index);
		const current = !allDone && index === nextMission && !done;
		const locked = !done && index > nextMission;
		const status = done ? '<strong class="status-done">✓ Visited</strong>' : current ? '<strong class="status-current">YOU ARE HERE</strong>' : locked ? '<strong class="status-locked">⌑ Up ahead</strong>' : '<strong>+2 stars</strong>';
		return `<article class="level-card ${locked ? 'is-locked' : 'is-available'}" ${locked ? '' : `tabindex="0" role="button" data-mission="${index}" aria-label="Start ${mission.title}"`}>
			<span class="trail-marker ${done ? 'is-done' : current ? 'is-current' : ''}" aria-hidden="true">${done ? '✓' : index + 1}</span>
			<span class="level-art tone-${mission.tone}">${mission.icon}</span>
			<span class="level-info"><h3>${mission.title}</h3><p>${mission.subtitle}</p></span>
			<span class="level-meta"><strong class="level-status">${status}</strong><span>${mission.duration}</span></span>
		</article>`;
	}).join('');
	document.querySelectorAll('[data-mission]').forEach(card => {
		card.addEventListener('click', () => openLesson(Number(card.dataset.mission)));
		card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLesson(Number(card.dataset.mission)); } });
	});
	document.querySelector('#guide-next').addEventListener('click', () => openLesson(Number(document.querySelector('#guide-next').dataset.mission)));
}

function openDialog(content) {
	document.querySelector('#dialog-content').innerHTML = content;
	document.querySelector('#modal-backdrop').hidden = false;
	document.querySelector('#dialog-close').focus();
}

function closeDialog() {
	document.querySelector('#modal-backdrop').hidden = true;
}

function openLesson(index) {
	if (index > state.completed.length && !state.completed.includes(index)) return;
	activeMission = index;
	const mission = missions[index];
	openDialog(`<p class="dialog-kicker">MISSION ${String(index + 1).padStart(2, '0')} / 05</p>
		<h2 id="dialog-title">${mission.title}</h2><p class="dialog-copy">Nova says: ${mission.subtitle}. Let's discover something wonderful together.</p>
		<div class="dialog-visual">${mission.icon}</div><div class="lesson-fact">${mission.fact}</div>
		<p class="quiz-question">Quick question: ${mission.question}</p>
		<div class="answer-list">${mission.answers.map((answer, answerIndex) => `<button class="answer-option" type="button" data-answer="${answerIndex}">${answer}</button>`).join('')}</div>
		<p class="quiz-feedback" id="quiz-feedback" aria-live="polite"></p>`);
	document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => checkAnswer(Number(button.dataset.answer), button)));
}

function checkAnswer(answerIndex, button) {
	const mission = missions[activeMission];
	const feedback = document.querySelector('#quiz-feedback');
	if (answerIndex !== mission.correct) {
		button.classList.add('is-wrong');
		feedback.style.color = '#d97463';
		feedback.textContent = 'Not quite. Give it another try!';
		return;
	}
	if (state.completed.includes(activeMission)) {
		button.classList.add('is-correct');
		feedback.textContent = 'That is right! Revisit anytime, explorer.';
		return;
	}
	state.completed.push(activeMission);
	state.stars += 2;
	saveState();
	render();
	button.classList.add('is-correct');
	document.querySelectorAll('.answer-option').forEach(option => { option.disabled = true; });
	feedback.textContent = 'Brilliant! You earned 2 stars. ✦';
	showToast('Mission complete! 2 stars added to your collection.');
}

function openLogin() {
	openDialog(`<p class="dialog-kicker">YOUR GALAXY, YOUR ADVENTURE</p><h2 id="dialog-title">Save your journey</h2>
		<p class="dialog-copy">Create a local explorer profile so your missions, stars, and prizes stay saved on this device.</p>
		<form id="profile-form"><label class="form-label" for="explorer-name">Explorer name</label><input class="form-input" id="explorer-name" name="name" maxlength="24" required autocomplete="nickname" placeholder="What should we call you?">
		<label class="form-label" for="explorer-email">Email address</label><input class="form-input" id="explorer-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
		<button class="button-primary dialog-action" type="submit">Save my profile <span aria-hidden="true">→</span></button></form>
		<p class="form-note">This demo saves your profile only in this browser. No account is sent to a server.</p>`);
	const form = document.querySelector('#profile-form');
	form.elements.name.value = state.name;
	form.elements.email.value = state.email;
	form.addEventListener('submit', event => {
		event.preventDefault();
		state.name = form.elements.name.value.trim();
		state.email = form.elements.email.value.trim();
		saveState();
		render();
		closeDialog();
		showToast(`Welcome aboard, ${state.name}! Your journey is saved.`);
	});
}

function openRewards() {
	const rewardItems = prizes.map(prize => {
		const claimed = state.claimed.includes(prize.id);
		const canClaim = state.stars >= prize.cost && !claimed;
		return `<div class="reward-item"><span class="reward-item-art">${prize.icon}</span><span><strong>${prize.title}</strong><small>${claimed ? 'Added to your collection' : prize.detail}</small></span><button class="redeem-button" type="button" data-prize="${prize.id}" ${canClaim ? '' : 'disabled'}>${claimed ? 'Collected' : `${prize.cost} ★`}</button></div>`;
	}).join('');
	openDialog(`<p class="dialog-kicker">YOUR COSMIC COLLECTION</p><h2 id="dialog-title">Prize shelf</h2><p class="dialog-copy">You have <strong>${state.stars} stars</strong>. Complete missions to earn more, then choose a prize.</p><div class="reward-grid">${rewardItems}</div>`);
	document.querySelectorAll('[data-prize]').forEach(button => button.addEventListener('click', () => {
		const prize = prizes.find(item => item.id === button.dataset.prize);
		if (!prize || state.stars < prize.cost || state.claimed.includes(prize.id)) return;
		state.stars -= prize.cost;
		state.claimed.push(prize.id);
		saveState();
		render();
		openRewards();
		showToast(`${prize.title} added to your collection!`);
	}));
}

function showToast(message) {
	const toast = document.querySelector('#toast');
	toast.textContent = message;
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

document.querySelector('#continue-button').addEventListener('click', () => openLesson(state.completed.length < missions.length ? state.completed.length : 0));
document.querySelector('#login-button').addEventListener('click', openLogin);
document.querySelector('#profile-button').addEventListener('click', openLogin);
document.querySelectorAll('[data-view="rewards"]').forEach(button => button.addEventListener('click', openRewards));
document.querySelectorAll('[data-view="map"]').forEach(button => button.addEventListener('click', () => document.querySelector('#map').scrollIntoView({ behavior: 'smooth' })));
document.querySelectorAll('.nav-link[data-view="home"]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
document.querySelectorAll('.nav-link[data-view="map"]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); document.querySelector('#map').scrollIntoView({ behavior: 'smooth' }); }));
document.querySelectorAll('.nav-link[data-view="rewards"]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); openRewards(); }));
document.querySelector('#sound-button').addEventListener('click', () => {
	state.sound = !state.sound;
	saveState();
	render();
	showToast(state.sound ? 'Sound setting turned on.' : 'Sound setting turned off.');
});
document.querySelector('#dialog-close').addEventListener('click', closeDialog);
document.querySelector('#modal-backdrop').addEventListener('click', event => { if (event.target.id === 'modal-backdrop') closeDialog(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDialog(); });
document.querySelector('#today-label').textContent = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date()).toUpperCase();
render();
