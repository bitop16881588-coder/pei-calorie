let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};
let waterData = JSON.parse(localStorage.getItem('waterLogByDate')) || {};
let selectedDate = new Date().toISOString().split('T')[0];

// 🌟 這裡就是你要的「常用食物快捷」清單，已經幫你新增好豐富的外食選項了！
const presetFoods = {
    staple: [
        { name: "🍚 白米飯(一碗)", calories: 280 }, { name: "🍱 雞胸肉健身餐盒", calories: 450 },
        { name: "🍱 排骨便當", calories: 850 }, { name: "🍙 鮪魚飯糰", calories: 190 },
        { name: "🍝 超商義大利麵", calories: 550 }, { name: "🍔 麥當勞大麥克", calories: 550 },
        { name: "🥟 水餃(10顆)", calories: 600 }
    ],
    protein: [
        { name: "🍗 紐奧良烤雞胸", calories: 120 }, { name: "🥚 茶葉蛋", calories: 70 },
        { name: "🥛 無糖豆漿(大)", calories: 200 }, { name: "🍳 荷包蛋", calories: 110 },
        { name: "🐟 煎鮭魚(100g)", calories: 210 }
    ],
    veg: [
        { name: "🥦 水煮綠花椰", calories: 35 }, { name: "🥬 燙青菜(淋油)", calories: 80 },
        { name: "🥗 凱薩沙拉(含醬)", calories: 350 }, { name: "🍅 大番茄", calories: 35 }
    ],
    snack: [
        { name: "🧋 50嵐 波霸奶茶(微糖)", calories: 500 }, { name: "🥤 麻古果粒茶", calories: 350 },
        { name: "🍵 清心 優多綠茶", calories: 320 }, { name: "☕ 五桐號 奶霜紅茶", calories: 400 },
        { name: "🍎 蘋果(中型)", calories: 90 }, { name: "🥜 綜合堅果(包)", calories: 160 }
    ]
};

document.addEventListener("DOMContentLoaded", init);

function init() {
    renderCalendar();
    renderQuickFood('staple');
    updateUI();
    renderWaterGrid();
    renderChart();
    setupRandomFoodFeature(); 
}

// 隨機飲食盲盒功能
function setupRandomFoodFeature() {
    const btnRandom = document.getElementById('btn-random-food');
    const resultDiv = document.getElementById('random-food-result');
    if (!btnRandom) return;

    btnRandom.onclick = () => {
        let combo = [];
        let total = 0;
        let html = '<div style="font-size: 0.8rem;">';
        
        ['staple', 'protein', 'veg', 'snack'].forEach(cat => {
            let list = presetFoods[cat];
            let item = list[Math.floor(Math.random() * list.length)];
            combo.push(item);
            total += item.calories;
            html += `${item.name} (${item.calories}k)<br>`;
        });

        html += `<hr>🔥 總熱量: ${total}k<br>`;
        html += `<button id="btn-apply-combo" style="margin-top:5px; cursor:pointer; background:#2ec4b6; color:white; border:none; padding:5px 10px; border-radius:5px;">一鍵寫入</button></div>`;
        resultDiv.innerHTML = html;

        document.getElementById('btn-apply-combo').onclick = () => {
            combo.forEach(f => addFood(f.name, f.calories));
            alert("已加入餐單！");
        };
    };
}

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
        btn.onclick = () => { selectedDate = dateStr; document.querySelectorAll('.day-card').forEach(c=>c.classList.remove('active')); btn.classList.add('active'); updateUI(); };
        container.appendChild(btn);
    }
}

function renderQuickFood(cat) {
    const pool = document.getElementById('quick-food-pool');
    if(!pool) return;
    pool.innerHTML = '';
    presetFoods[cat].forEach(f => {
        let b = document.createElement('button');
        b.className = 'quick-food-btn';
        b.innerHTML = `${f.name} <span>${f.calories}k</span>`;
        b.onclick = () => { addFood(f.name, f.calories); };
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
    const prog = document.querySelector('.progress-circle');
    let p = Math.min((total/2000)*100, 100);
    prog.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2ec4b6 ${p}%, #e0e0e0 0%)`;
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

function renderChart() {
    const ctx = document.getElementById('calorieLineChart')?.getContext('2d');
    if(!ctx) return;
    new Chart(ctx, { type: 'line', data: { labels: ['一','二','三','四','五','六','日'], datasets: [{ data: [1800, 1500, 1900, 1300, 2000, 1600, 0], borderColor: '#2ec4b6', tension: 0.4 }] }, options: { plugins: { legend: { display: false } } }});
}
