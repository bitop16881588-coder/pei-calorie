const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const foodCaloriesInput = document.getElementById('food-calories');
const foodList = document.getElementById('food-list');
const totalCaloriesEl = document.getElementById('total-calories');
const progressCircle = document.querySelector('.progress-circle');
const calendarDays = document.getElementById('calendar-days');
const currentDateLabel = document.getElementById('current-date-label');
const btnPrevWeek = document.getElementById('btn-prev-week');
const btnNextWeek = document.getElementById('btn-next-week');
const quickFoodPool = document.getElementById('quick-food-pool');
const categoryTabs = document.querySelector('.category-tabs');

// 左側統計數據DOM
const avgCaloriesEl = document.getElementById('avg-calories');
const recordedDaysEl = document.getElementById('recorded-days');
const maxCaloriesEl = document.getElementById('max-calories');

// 右側小工具DOM
const waterCupGrid = document.getElementById('water-cup-grid');
const waterCountEl = document.getElementById('water-count');
const btnCalcTdee = document.getElementById('btn-calc-tdee');
const tdeeWeightInput = document.getElementById('tdee-weight');
const tdeeHeightInput = document.getElementById('tdee-height');
const tdeeResultEl = document.getElementById('tdee-result');

// 隨機飲食DOM
const btnRandomFood = document.getElementById('btn-random-food');
const randomFoodResultEl = document.getElementById('random-food-result');

const DAILY_GOAL = 2000;
let baseDate = new Date();

function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

let selectedDate = getFormattedDate(new Date());
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};
let waterData = JSON.parse(localStorage.getItem('waterLogByDate')) || {};

// 🌟 食物資料庫選單：全面精準繁體化
const presetFoods = {
    staple: [
        { name: "🍚 白米飯(一碗)", calories: 280 },
        { name: "🍜 水煮麵條(碗)", calories: 220 },
        { name: "🍞 全麥麵包(片)", calories: 80 },
        { name: "🍠 蒸地瓜(中)", calories: 140 },
        { name: "🌽 水煮玉米(根)", calories: 150 },
        { name: "🍱 烤雞腿便當", calories: 750 },
        { name: "🍛 咖喱飯", calories: 850 },
        { name: "🥪 超商三明治", calories: 300 },
        { name: "🍙 肉鬆御飯糰", calories: 210 }
    ],
    protein: [
        { name: "🥚 水煮蛋(顆)", calories: 75 },
        { name: "🍳 荷包蛋(顆)", calories: 110 },
        { name: "🍗 煎雞胸肉(100g)", calories: 140 },
        { name: "🥩 滷牛肉(100g)", calories: 150 },
        { name: "🐟 煎鮭魚(100g)", calories: 210 },
        { name: "🥛 鮮乳(290ml)", calories: 180 },
        { name: "🥛 無糖豆漿(400ml)", calories: 130 },
        { name: "🍦 無糖優格(杯)", calories: 80 },
        { name: "🥘 豆腐(半盒)", calories: 70 }
    ],
    veg: [
        { name: "🥦 水煮綠花椰", calories: 35 },
        { name: "🥬 燙青菜", calories: 40 },
        { name: "🍅 大番茄(顆)", calories: 35 },
        { name: "🥒 小黃瓜(條)", calories: 20 },
        { name: "🥗 綜合沙拉(無醬)", calories: 45 },
        { name: "🍄 炒綜合菇類", calories: 50 },
        { name: "🧅 洋蔥炒蛋(盤)", calories: 120 }
    ],
    snack: [
        { name: "🍎 蘋果(中型)", calories: 90 },
        { name: "🍌 香蕉(中型)", calories: 100 },
        { name: "🥝 奇異果(顆)", calories: 45 },
        { name: "🥜 綜合堅果(包)", calories: 160 },
        { name: "☕ 黑咖啡(杯)", calories: 5 },
        { name: "☕ 無糖拿鐵(杯)", calories: 120 },
        { name: "🧋 珍奶(微糖微冰)", calories: 550 },
        { name: "🍵 無糖綠茶", calories: 0 },
        { name: "🍫 巧克力(一片)", calories: 250 }
    ]
};

let currentRandomCombo = [];

document.addEventListener("DOMContentLoaded", function() {
    init();
    initChart();
});

function init() {
    renderCalendarPagination();
    switchQuickFoodCategory('staple');
    updateUI();
    renderWaterGrid();
    calculateStats();
    setupEventListeners();
}

function renderCalendarPagination() {
    if (!calendarDays) return;
    calendarDays.innerHTML = '';
    for (let i = -2; i <= 2; i++) {
        let d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dateStr = getFormattedDate(d);
        const monthStr = `${d.getMonth() + 1}月`;
        const dayNum = d.getDate();
        
        const card = document.createElement('div');
        card.className = `day-card ${dateStr === selectedDate ? 'active' : ''}`;
        card.setAttribute('data-date', dateStr);
        card.innerHTML = `<span class="month-label">${monthStr}</span><span class="day-number">${dayNum}</span>`;
        calendarDays.appendChild(card);
    }
}

function switchQuickFoodCategory(category) {
    if (!quickFoodPool) return;
    quickFoodPool.innerHTML = '';
    const foods = presetFoods[category] || [];
    foods.forEach(food => {
        const btn = document.createElement('button');
        btn.className = 'quick-food-btn';
        btn.innerHTML = `${food.name} <span>${food.calories}k</span>`;
        btn.addEventListener('click', () => { addMealRecord(food.name, food.calories); });
        quickFoodPool.appendChild(btn);
    });
}

function addMealRecord(name, calories) {
    const newMeal = { id: Date.now() + Math.random(), name: name, calories: calories };
    if (!allData[selectedDate]) allData[selectedDate] = [];
    allData[selectedDate].push(newMeal);
    saveToLocalStorage();
    updateUI();
    calculateStats();
}

function calculateStats() {
    const keys = Object.keys(allData);
    const dayCount = keys.length;
    if (recordedDaysEl) recordedDaysEl.textContent = dayCount + ' ';
    
    if (dayCount === 0) {
        if (avgCaloriesEl) avgCaloriesEl.innerHTML = `0 <small>kcal</small>`;
        if (maxCaloriesEl) maxCaloriesEl.innerHTML = `0 <small>kcal</small>`;
        return;
    }
    let totalSum = 0, maxVal = 0;
    keys.forEach(dateKey => {
        const daySum = allData[dateKey].reduce((sum, item) => sum + item.calories, 0);
        totalSum += daySum;
        if (daySum > maxVal) maxVal = daySum;
    });
    if (avgCaloriesEl) avgCaloriesEl.innerHTML = `${Math.round(totalSum / dayCount)} <small>kcal</small>`;
    if (maxCaloriesEl) maxCaloriesEl.innerHTML = `${maxVal} <small>kcal</small>`;
}

function renderWaterGrid() {
    if (!waterCupGrid) return;
    waterCupGrid.innerHTML = '';
    const currentCups = waterData[selectedDate] || 0;
    if (waterCountEl) waterCountEl.textContent = currentCups * 250;
    for (let i = 1; i <= 8; i++) {
        const btn = document.createElement('button');
        btn.className = `cup-btn ${i <= currentCups ? 'active' : ''}`;
        btn.textContent = '🥛';
        btn.addEventListener('click', () => { toggleWaterCup(i); });
        waterCupGrid.appendChild(btn);
    }
}

function toggleWaterCup(index) {
    let currentCups = waterData[selectedDate] || 0;
    waterData[selectedDate] = (currentCups === index) ? index - 1 : index;
    localStorage.setItem('waterLogByDate', JSON.stringify(waterData));
    renderWaterGrid();
}

function updateUI() {
    if (!foodList) return;
    foodList.innerHTML = '';
    const todayStr = getFormattedDate(new Date());
    if (currentDateLabel) currentDateLabel.textContent = (selectedDate === todayStr) ? '今日' : selectedDate.split('-').slice(1).join('/');

    const currentMeals = allData[selectedDate] || [];
    if (currentMeals.length === 0) {
        foodList.innerHTML = '<li class="empty-msg">這天還沒有記錄哦，吃點什麼吧！</li>';
        if (totalCaloriesEl) totalCaloriesEl.textContent = 0;
        updateProgress(0);
        renderWaterGrid();
        return;
    }
    let totalCalories = 0;
    currentMeals.forEach((meal) => {
        totalCalories += meal.calories;
        const li = document.createElement('li');
        li.className = 'food-item';
        li.innerHTML = `<div class="food-info"><span class="name">${meal.name}</span><span class="cal">${meal.calories} kcal</span></div><button class="btn-delete" data-id="${meal.id}">&times;</button>`;
        foodList.appendChild(li);
    });
    if (totalCaloriesEl) totalCaloriesEl.textContent = totalCalories;
    updateProgress(totalCalories);
    renderWaterGrid();
}

function updateProgress(total) {
    if (!progressCircle) return;
    const percentage = Math.min((total / DAILY_GOAL) * 100, 100);
    progressCircle.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(--primary-color) ${percentage}%, #e0e0e0 ${percentage}%)`;
}

// 🌟 左側圖表趨勢繁體化
function initChart() {
    const chartCanvas = document.getElementById('calorieLineChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    
    const data = {
        labels: ['週一', '週二', '週三', '週四', '週五', '週六', '今日'],
        datasets: [{
            label: '每日攝入',
            data: [1850, 1600, 1950, 1400, 2100, 1750, 0],
            borderColor: '#2ec4b6',
            backgroundColor: 'rgba(46, 196, 182, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#ff9f1c',
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, suggestedMax: 2500, grid: { color: 'rgba(237, 242, 247, 0.8)' }, ticks: { color: '#777', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: '#777', font: { size: 11 } } }
            },
            animation: { duration: 1500, easing: 'easeInOutQuart' }
        }
    });
}

function setupEventListeners() {
    if (foodForm) {
        foodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = foodNameInput.value.trim();
            const calories = parseInt(foodCaloriesInput.value);
            if (!name || !calories) return;
            addMealRecord(name, calories);
            foodForm.reset();
            foodNameInput.focus();
        });
    }
    if (categoryTabs) {
        categoryTabs.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-btn')) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                switchQuickFoodCategory(e.target.getAttribute('data-cat'));
            }
        });
    }
    if (foodList) {
        foodList.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-delete')) {
                const idToDelete = parseFloat(e.target.getAttribute('data-id'));
                allData[selectedDate] = allData[selectedDate].filter(meal => meal.id !== idToDelete);
                if (allData[selectedDate].length === 0) delete allData[selectedDate];
                saveToLocalStorage(); updateUI(); calculateStats();
            }
        });
    }
    if (calendarDays) {
        calendarDays.addEventListener('click', function(e) {
            const card = e.target.closest('.day-card');
            if (card) {
                selectedDate = card.getAttribute('data-date');
                document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                updateUI();
            }
        });
    }

    if (btnPrevWeek) btnPrevWeek.addEventListener('click', function() { baseDate.setDate(baseDate.getDate() - 5); renderCalendarPagination(); });
    if (btnNextWeek) btnNextWeek.addEventListener('click', function() { baseDate.setDate(baseDate.getDate() + 5); renderCalendarPagination(); });

    if (btnCalcTdee) {
        btnCalcTdee.addEventListener('click', function() {
            const w = parseFloat(tdeeWeightInput.value);
            const h = parseFloat(tdeeHeightInput.value);
            if(!w || !h) { tdeeResultEl.textContent = '請先輸入身高和體重哦！'; return; }
            const bmr = Math.round((10 * w) + (6.25 * h) - (5 * 25) + 5);
            const tdee = Math.round(bmr * 1.3);
            tdeeResultEl.style.padding = '12px';
            tdeeResultEl.innerHTML = `🌟 預估基礎代謝(BMR): <b>${bmr}</b> kcal<br>日常維持熱量(TDEE): <b>${tdee}</b> kcal<br>👉 建議減脂目標: <b>${tdee - 300}~${tdee}</b> kcal`;
        });
    }

    if (btnRandomFood) {
        btnRandomFood.addEventListener('click', function() {
            const categories = ['staple', 'protein', 'veg', 'snack'];
            currentRandomCombo = []; let totalRandomCalories = 0;
            let htmlContent = `<div style="text-align:left; font-size:0.85rem; color:#475569;">`;
            categories.forEach(cat => {
                const list = presetFoods[cat]; const randomItem = list[Math.floor(Math.random() * list.length)];
                currentRandomCombo.push(randomItem); totalRandomCalories += randomItem.calories;
                let prefix = cat==='staple'?"🍞 ":cat==='protein'?"🥩 ":cat==='veg'?"🥦 ":"🍎 ";
                htmlContent += `${prefix}${randomItem.name} (${randomItem.calories}k)<br>`;
            });
            htmlContent += `<hr style="margin:8px 0; border:none; border-top:1px dashed #cbd5e1;">🔥 總熱量: <b>${totalRandomCalories}</b> kcal<br><button id="btn-add-random-combo" style="width:100%; background-color:#2ec4b6; color:white; border:none; padding:6px; border-radius:6px; margin-top:8px; font-weight:bold; cursor:pointer;">直接吃這套！一鍵寫入</button></div>`;
            randomFoodResultEl.style.padding = '12px'; randomFoodResultEl.innerHTML = htmlContent;

            document.getElementById('btn-add-random-combo').addEventListener('click', function() {
                currentRandomCombo.forEach(food => { addMealRecord("🎲 " + food.name, food.calories); });
                alert('成功！已將這套隨機健康餐加入你的餐單囉 🎉');
            });
        });
    }
}

function saveToLocalStorage() {
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
}
