// 全域狀態
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};
let waterData = JSON.parse(localStorage.getItem('waterLogByDate')) || {};
let selectedDate = new Date().toISOString().split('T')[0];

const presetFoods = {
    staple: [{ name: "🍚 白米飯", calories: 280 }, { name: "🍱 雞胸肉餐盒", calories: 450 }],
    protein: [{ name: "🥚 水煮蛋", calories: 75 }, { name: "🍗 煎雞胸肉", calories: 140 }],
    veg: [{ name: "🥦 花椰菜", calories: 35 }, { name: "🥗 凱薩沙拉", calories: 350 }],
    snack: [{ name: "🍎 蘋果", calories: 90 }, { name: "🧋 珍奶", calories: 650 }]
};

// 分頁切換邏輯
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId + '-tab').style.display = 'block';
    event.currentTarget.classList.add('active');
}

// 綠拿鐵計算器
function calculateSmoothie() {
    const total = parseInt(document.getElementById('veg-select').value) + 
                  parseInt(document.getElementById('fruit-select').value) + 
                  parseInt(document.getElementById('liquid-select').value);
    
    const res = document.getElementById('smoothie-result');
    res.innerHTML = `總熱量: <b>${total} kcal</b><br>`;
    
    let btn = document.createElement('button');
    btn.textContent = "加入今日餐單";
    btn.onclick = () => { addFood("綠拿鐵", total); alert("已加入！"); };
    res.appendChild(btn);
}

// 基礎功能
document.addEventListener("DOMContentLoaded", () => {
    renderQuickFood('staple');
    updateUI();
});

function renderQuickFood(cat) {
    const pool = document.getElementById('quick-food-pool');
    if(!pool) return;
    pool.innerHTML = '';
    presetFoods[cat].forEach(f => {
        let b = document.createElement('button');
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
        li.innerHTML = `<div>${f.name} (${f.calories}k)</div>`;
        list.appendChild(li);
    });
    totalEl.textContent = "今日總熱量: " + total;
}
