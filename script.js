// 核心數據
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};
let waterData = JSON.parse(localStorage.getItem('waterLogByDate')) || {};
let selectedDate = new Date().toISOString().split('T')[0];

const presetFoods = {
    staple: [
        { name: "🍚 白米飯(一碗)", calories: 280 }, { name: "🍜 水煮麵條(碗)", calories: 220 },
        { name: "🍱 烤雞腿便當", calories: 750 }, { name: "🍛 咖喱飯", calories: 850 },
        { name: "🥪 超商三明治", calories: 300 }, { name: "🍙 肉鬆御飯糰", calories: 210 },
        { name: "🍔 麥當勞漢堡", calories: 550 }, { name: "🍟 中薯條", calories: 350 },
        { name: "🍕 夏威夷披薩", calories: 280 }, { name: "🥟 水餃(10顆)", calories: 600 },
        { name: "🍝 義大利麵", calories: 650 }, { name: "🍱 雞胸肉健身餐盒", calories: 450 }
    ],
    protein: [
        { name: "🥚 水煮蛋(顆)", calories: 75 }, { name: "🍳 荷包蛋(顆)", calories: 110 },
        { name: "🍗 煎雞胸肉(100g)", calories: 140 }, { name: "🥩 滷牛肉(100g)", calories: 150 },
        { name: "🐟 煎鮭魚(100g)", calories: 210 }, { name: "🥛 鮮乳(290ml)", calories: 180 },
        { name: "🥛 無糖豆漿(400ml)", calories: 130 }, { name: "🥓 培根(兩片)", calories: 120 },
        { name: "🍗 炸雞腿(一隻)", calories: 350 }, { name: "🥘 豆腐(半盒)", calories: 70 },
        { name: "🍗 紐奧良烤雞胸", calories: 120 }, { name: "🥚 茶葉蛋", calories: 70 }
    ],
    veg: [
        { name: "🥦 水煮綠花椰", calories: 35 }, { name: "🥬 燙青菜(淋油)", calories: 80 },
        { name: "🍅 大番茄(顆)", calories: 35 }, { name: "🥒 小黃瓜(條)", calories: 20 },
        { name: "🥗 凱薩沙拉(含醬)", calories: 350 }, { name: "🍄 炒綜合菇類", calories: 50 },
        { name: "🧅 洋蔥炒蛋", calories: 120 }, { name: "🌽 玉米濃湯", calories: 150 }
    ],
    snack: [
        { name: "🍎 蘋果(中型)", calories: 90 }, { name: "🍌 香蕉(中型)", calories: 100 },
        { name: "🥝 奇異果(顆)", calories: 45 }, { name: "🥜 綜合堅果(包)", calories: 160 },
        { name: "☕ 黑咖啡(杯)", calories: 5 }, { name: "☕ 無糖拿鐵(杯)", calories: 120 },
        { name: "🧋 50嵐 波霸奶茶(微糖)", calories: 500 }, { name: "🥤 麻古果粒茶", calories: 350 },
        { name: "🍵 清心 優多綠茶(半糖)", calories: 320 }, { name: "☕ 五桐號 奶霜紅茶", calories: 400 },
        { name: "🍦 冰淇淋(球)", calories: 200 }, { name: "🍫 巧克力(一片)", calories: 250 }
    ]
};

// 確保頁面載入後才執行
document.addEventListener("DOMContentLoaded", () => {
    try {
        init();
    } catch (err) {
        console.error("初始化錯誤:", err);
    }
});

function init() {
    renderCalendar();
    renderQuickFood('staple');
    updateUI();
    renderWaterGrid();
    setupEventListeners();
    initChart(); // 如果圖表抓不到ID，這會跳過，不影響其他功能
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
}

window.deleteFood = (id) => {
    allData[selectedDate] = allData[selectedDate].filter(f => f.id !== id);
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
    updateUI();
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
        btn.onclick = () => { selectedDate = dateStr; document.querySelectorAll('.day-card').forEach(c=>c.classList.remove('active')); btn.classList.add('active'); updateUI(); };
        container.appendChild(btn);
    }
}

function initChart() {
    const ctx = document.getElementById('calorieLineChart')?.getContext('2d');
    if(!ctx) return;
    new Chart(ctx, { type: 'line', data: { labels: ['一','二','三','四','五','六','日'], datasets: [{ data: [1800, 1500, 1900, 1300, 2000, 1600, 0], borderColor: '#2ec4b6' }] }, options: { plugins: { legend: { display: false } } }});
}

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderQuickFood(btn.dataset.cat);
        };
    });
}
