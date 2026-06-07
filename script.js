// === 初始化核心 ===
document.addEventListener("DOMContentLoaded", function() {
    initApp();
});

// 資料庫
const presetFoods = {
    staple: [
        { name: "🍚 白米飯(一碗)", calories: 280 }, { name: "🍜 水煮麵條(碗)", calories: 220 },
        { name: "🍱 烤雞腿便當", calories: 750 }, { name: "🍔 麥當勞漢堡", calories: 550 },
        { name: "🥪 超商三明治", calories: 300 }, { name: "🍙 肉鬆御飯糰", calories: 210 }
    ],
    protein: [
        { name: "🥚 水煮蛋(顆)", calories: 75 }, { name: "🍳 荷包蛋(顆)", calories: 110 },
        { name: "🍗 煎雞胸肉(100g)", calories: 140 }, { name: "🥩 滷牛肉(100g)", calories: 150 },
        { name: "🐟 煎鮭魚(100g)", calories: 210 }, { name: "🥛 無糖豆漿(400ml)", calories: 130 }
    ],
    veg: [
        { name: "🥦 水煮綠花椰", calories: 35 }, { name: "🥬 燙青菜(淋油)", calories: 80 },
        { name: "🍅 大番茄(顆)", calories: 35 }, { name: "🥗 凱薩沙拉(含醬)", calories: 350 }
    ],
    snack: [
        { name: "🍎 蘋果(中型)", calories: 90 }, { name: "🍌 香蕉(中型)", calories: 100 },
        { name: "☕ 黑咖啡(杯)", calories: 5 }, { name: "🧋 珍奶(全糖)", calories: 650 }
    ]
};

// 全域狀態
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};
let waterData = JSON.parse(localStorage.getItem('waterLogByDate')) || {};
let selectedDate = new Date().toISOString().split('T')[0];

function initApp() {
    renderCalendar();
    setupCategoryTabs();
    renderQuickFood('staple');
    updateUI();
    renderWaterGrid();
    setupManualForm();
    setupTools();
    initChart();
}

// === 功能邏輯 ===
function setupCategoryTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderQuickFood(tab.dataset.cat);
        };
    });
}

function renderQuickFood(cat) {
    const pool = document.getElementById('quick-food-pool');
    if(!pool) return;
    pool.innerHTML = '';
    presetFoods[cat].forEach(f => {
        let b = document.createElement('button');
        b.className = 'quick-food-btn';
        b.innerHTML = `${f.name} <span>${f.calories}k</span>`;
        b.onclick = () => addFood(f.name, f.calories);
        pool.appendChild(b);
    });
}

function addFood(name, cal) {
    if(!allData[selectedDate]) allData[selectedDate] = [];
    allData[selectedDate].push({id: Date.now(), name, calories: cal});
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
    updateUI();
}

function updateUI() {
    const list = document.getElementById('food-list');
    const totalEl = document.getElementById('total-calories');
    if(!list) return;
    list.innerHTML = '';
    let total = 0;
    (allData[selectedDate] || []).forEach(f => {
        total += f.calories;
        let li = document.createElement('li');
        li.className = 'food-item';
        li.innerHTML = `<div class="food-info"><span class="name">${f.name}</span><span class="cal">${f.calories} kcal</span></div><button onclick="deleteFood(${f.id})">&times;</button>`;
        list.appendChild(li);
    });
    totalEl.textContent = total;
    // 圓環更新
    const prog = document.querySelector('.progress-circle');
    let p = Math.min((total/2000)*100, 100);
    if(prog) prog.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2ec4b6 ${p}%, #e0e0e0 0%)`;
}

function deleteFood(id) {
    allData[selectedDate] = allData[selectedDate].filter(f => f.id !== id);
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
    updateUI();
}

function renderWaterGrid() {
    const grid = document.getElementById('water-cup-grid');
    if(!grid) return;
    grid.innerHTML = '';
    for(let i=1; i<=8; i++) {
        let b = document.createElement('button');
        b.className = `cup-btn ${(waterData[selectedDate] || 0) >= i ? 'active' : ''}`;
        b.textContent = '🥛';
        b.onclick = () => { waterData[selectedDate] = i; localStorage.setItem('waterLogByDate', JSON.stringify(waterData)); renderWaterGrid(); };
        grid.appendChild(b);
    }
}

function setupTools() {
    // TDEE 工具
    document.getElementById('btn-calc-tdee').onclick = () => {
        const w = parseFloat(document.getElementById('tdee-weight').value);
        const h = parseFloat(document.getElementById('tdee-height').value);
        if(!w || !h) return alert('請輸入數值');
        const bmr = Math.round((10 * w) + (6.25 * h) - 25);
        document.getElementById('tdee-result').innerHTML = `🌟 基礎代謝: ${bmr}k | 建議減脂: ${Math.round(bmr*1.3 - 300)}k`;
    };
    
    // 隨機盲盒工具
    document.getElementById('btn-random-food').onclick = () => {
        const res = document.getElementById('random-food-result');
        let combo = ['staple','protein','veg','snack'].map(c => presetFoods[c][Math.floor(Math.random()*presetFoods[c].length)]);
        let html = combo.map(f => `${f.name} (${f.calories}k)`).join('<br>');
        res.innerHTML = `${html}<br><button onclick="applyCombo(${JSON.stringify(combo).replace(/"/g, "'")})" style="cursor:pointer; background:#2ec4b6; color:white; border:none; padding:3px 8px; border-radius:4px;">一鍵寫入</button>`;
    };
}

// 隨機餐單寫入輔助函數
window.applyCombo = (combo) => {
    combo.forEach(f => addFood(f.name, f.calories));
    alert("已加入餐單！");
};

function renderCalendar() {
    const container = document.getElementById('calendar-days');
    if(!container) return;
    container.innerHTML = '';
    for(let i=-2; i<=2; i++) {
        let d = new Date(); d.setDate(d.getDate() + i);
        let dateStr = d.toISOString().split('T')[0];
        let btn = document.createElement('div');
        btn.className = `day-card ${dateStr === selectedDate ? 'active' : ''}`;
        btn.innerHTML = `<span class="month-label">${d.getMonth()+1}月</span><span class="day-number">${d.getDate()}</span>`;
        btn.onclick = () => { selectedDate = dateStr; document.querySelectorAll('.day-card').forEach(c=>c.classList.remove('active')); btn.classList.add('active'); updateUI(); renderWaterGrid(); };
        container.appendChild(btn);
    }
}

function initChart() {
    const ctx = document.getElementById('calorieLineChart')?.getContext('2d');
    if(!ctx) return;
    new Chart(ctx, { type: 'line', data: { labels: ['一','二','三','四','五','六','日'], datasets: [{ data: [1800, 1500, 1900, 1300, 2000, 1600, 0], borderColor: '#2ec4b6', tension: 0.4 }] }, options: { plugins: { legend: { display: false } } }});
}
