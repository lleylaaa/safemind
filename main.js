// Welkom-scherm knop
const welcomeScreen = document.getElementById('welcome-screen');
const startBtn = document.getElementById('startBtn');
const dashboard = document.getElementById('dashboard');
const screens = document.querySelectorAll('.screen');
const menuButtons = document.querySelectorAll('#menu button');

startBtn.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    dashboard.style.display = 'block';
    showScreen('mood-screen');
});

// Menu navigatie
menuButtons.forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

function showScreen(screenId){
    screens.forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
}

// Mood buttons en opslaan
const moodButtons = document.querySelectorAll('#mood-buttons button');
const saveBtn = document.getElementById('saveMood');
const noteInput = document.getElementById('note');
let selectedMood = '';

moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedMood = btn.dataset.mood;
        moodButtons.forEach(b => b.style.border = '');
        btn.style.border = '2px solid #333';
    });
});

// Opslaan mood
saveBtn.addEventListener('click', () => {
    if(!selectedMood){ alert('Kies eerst een mood!'); return; }
    const entry = {
        mood: selectedMood,
        note: noteInput.value,
        sleep: null,
        date: new Date().toISOString()
    };
    saveEntry(entry);
    noteInput.value = '';
    selectedMood = '';
    moodButtons.forEach(b => b.style.border = '');
    alert('Mood opgeslagen! Ga nu naar Slaap scherm.');
});

// Sleep buttons en opslaan
const sleepButtons = document.querySelectorAll('#sleep-buttons button');
const saveSleepBtn = document.getElementById('saveSleep');
let selectedSleep = '';

sleepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedSleep = btn.dataset.sleep;
        sleepButtons.forEach(b => b.style.border = '');
        btn.style.border = '2px solid #333';
    });
});

saveSleepBtn.addEventListener('click', () => {
    if(!selectedSleep){ alert('Kies eerst je slaap!'); return; }
    const entries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    const lastEntry = entries[entries.length -1];
    if(lastEntry) lastEntry.sleep = selectedSleep;
    localStorage.setItem('moodEntries', JSON.stringify(entries));
    selectedSleep = '';
    sleepButtons.forEach(b => b.style.border = '');
    alert('Slaap opgeslagen!');
    loadMoods();
});

// Opslaan functie
function saveEntry(entry){
    const entries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    entries.push(entry);
    localStorage.setItem('moodEntries', JSON.stringify(entries));
}

// Laden van moods en grafiek
const graph = document.getElementById('graph');
const weeklyChartCtx = document.getElementById('weeklyChart').getContext('2d');
let weeklyChart;

function loadMoods(){
    graph.innerHTML = '';
    if(weeklyChart) weeklyChart.destroy();
    const entries = JSON.parse(localStorage.getItem('moodEntries')) || [];

    // Overzicht
    entries.forEach(e => {
        const p = document.createElement('p');
        const d = new Date(e.date);
        p.textContent = `${d.toLocaleDateString()} - Mood: ${e.mood || '-'} - Slaap: ${e.sleep || '-'} - Notitie: ${e.note || ''}`;
        graph.appendChild(p);
    });

    // Week gemiddeld
    const weekMap = {};
    entries.forEach(e => {
        const d = new Date(e.date);
        const week = getWeekNumber(d);
        if(!weekMap[week]) weekMap[week] = [];
        weekMap[week].push(emojiToScore(e.mood));
    });

    const labels = Object.keys(weekMap).sort();
    const data = labels.map(l => {
        const arr = weekMap[l];
        return Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
    });

    weeklyChart = new Chart(weeklyChartCtx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Gemiddelde mood per week', data, borderColor: '#4CAF50', fill: false }] },
        options: { scales: { y: { min:1, max:3, ticks:{ stepSize:1 } } } }
    });
}

function emojiToScore(m){
    if(m==='😊') return 3;
    if(m==='😐') return 2;
    if(m==='😔') return 1;
    return 2;
}

function getWeekNumber(d){
    const date = new Date(d.getTime());
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 4 - (date.getDay()||7));
    const yearStart = new Date(date.getFullYear(),0,1);
    const weekNo = Math.ceil((((date - yearStart)/86400000) + 1)/7);
    return `${date.getFullYear()}-W${weekNo}`;
}

// Initial load
window.addEventListener('load', loadMoods);

// Service Worker registratie
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js')
    .then(()=>console.log('Service worker geregistreerd!'))
    .catch(err=>console.log('Service worker fout:', err));
}
