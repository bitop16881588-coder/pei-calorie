// 核心設定
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};
let waterData = JSON.parse(localStorage.getItem('waterLogByDate')) || {};
let selectedDate = new Date().toISOString().split('T')[0];

const presetFoods = {
    staple: [{ name: "🍚 白米飯", calories: 280 }, { name: "🍱 雞胸肉餐盒", calories: 450 }, { name: "🍔 漢堡", calories: 550 }],
    protein: [{ name: "🥚 水煮蛋", calories: 75 }, { name: "🍗 煎雞胸肉", calories: 140 }],
    veg: [{ name: "🥦 花椰菜", calories: 35 }, { name: "🥗 凱薩沙拉", calories: 350 }],
    snack: [{ name: "🍎 蘋果", calories: 90 }, { name: "🧋 珍奶", calories: 650 }]
};

// 確保 DOM 載入後才執行
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    renderQuickFood('staple');
    updateUI();
    
    // 強制初始化各區塊，增加錯誤防護
    if (document.getElementById('calorieLineChart')) initChart();
    if (document.getElementById('water-cup-grid')) renderWaterGrid();
    if (document.getElementById('btn-random-food')) setupRandomFood();
    
    // 綁定選單
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderQuickFood(btn.dataset.cat);
        };
    });
}

// === 1. 飲水追蹤修复 ===
function renderWaterGrid() {
    const grid = document.getElementById('water-cup-grid');
    const countEl = document.getElementById('water-count');
    if (!grid) return;
    grid.innerHTML = '';
    const current = waterData[selectedDate] || 0;
    if (countEl) countEl.textContent = current * 250;
    for (let i = 1; i <= 8; i++) {
        let b = document.createElement('button');
        b.className = `cup-btn ${current >= i ? 'active' : ''}`;
        b.textContent = '🥛';
        b.onclick = () => {
            waterData[selectedDate] = i;
            localStorage.setItem('waterLogByDate', JSON.stringify(waterData));
            renderWaterGrid();
        };
        grid.appendChild(b);
    }
}

// === 2. 隨機盲盒修复 ===
function setupRandomFood() {
    const btn = document.getElementById('btn-random-food');
    const res = document.getElementById('random-food-result');
    if (!btn) return;
    btn.onclick = () => {
        let combo = ['staple','protein','veg','snack'].map(c => presetFoods[c][Math.floor(Math.random()*presetFoods[c].length)]);
        let total = combo.reduce((s, i) => s + i.calories, 0);
        res.innerHTML = combo.map(f => `<div style="font-size:0.8rem">${f.name} (${f.calories}k)</div>`).join('') +
                        `<strong>🔥 總計: ${total}k</strong><br><button id="btn-apply" style="background:#2ec4b6; color:white; border:none; padding:3px 8px; border-radius:4px;">一鍵寫入</button>`;
        document.getElementById('btn-apply').onclick = () => {
            combo.forEach(f => addFood(f.name, f.calories));
            alert("已加入今日餐單！");
        };
    };
}

// === 3. 圖表渲染修复 ===
function initChart() {
    const ctx = document.getElementById('calorieLineChart')?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['一', '二', '三', '四', '五', '六', '日'],
            datasets: [{ data: [1800, 1500, 1900, 1300, 2000, 1600, 0], borderColor: '#2ec4b6', tension: 0.4 }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

// === 其他輔助函數 ===
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
}

window.deleteFood = (id) => {
    allData[selectedDate] = allData[selectedDate].filter(f => f.id !== id);
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
    updateUI();
};
