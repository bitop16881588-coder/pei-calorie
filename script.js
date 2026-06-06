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

const DAILY_GOAL = 2000;
let baseDate = new Date();
let selectedDate = getFormattedDate(new Date());
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};

// 豐富的飲食資料庫（包含在地小吃、超商外食、飲料）
const presetFoods = {
    staple: [
        { name: "🍚 白米饭(一碗)", calories: 280 },
        { name: "🍜 水煮面条(碗)", calories: 220 },
        { name: "🍞 全麦面包(片)", calories: 80 },
        { name: "🍠 蒸地瓜(中)", calories: 140 },
        { name: "🌽 水煮玉米(根)", calories: 150 },
        { name: "🍱 烤鸡腿便当", calories: 750 },
        { name: "🍛 咖喱饭", calories: 850 },
        { name: "🥪 超商三明治", calories: 300 },
        { name: "🍙 肉松御饭团", calories: 210 }
    ],
    protein: [
        { name: "🥚 水煮蛋(颗)", calories: 75 },
        { name: "🍳 荷包蛋(颗)", calories: 110 },
        { name: "🍗 煎鸡胸肉(100g)", calories: 140 },
        { name: "🥩 卤牛肉(100g)", calories: 150 },
        { name: "🐟 煎鲑鱼(100g)", calories: 210 },
        { name: "🥛 鲜乳(290ml)", calories: 180 },
        { name: "🥛 无糖豆浆(400ml)", calories: 130 },
        { name: "🍦 无糖优格(杯)", calories: 80 },
        { name: "🥘 豆腐(半盒)", calories: 70 }
    ],
    veg: [
        { name: "🥦 水煮绿花椰", calories: 35 },
        { name: "🥬 烫青菜", calories: 40 },
        { name: "🍅 大番茄(颗)", calories: 35 },
        { name: "🥒 小黄瓜(条)", calories: 20 },
        { name: "🥗 综合沙拉(无酱)", calories: 45 },
        { name: "🍄 炒综合菇类", calories: 50 },
        { name: "🧅 洋葱炒蛋(盘)", calories: 120 }
    ],
    snack: [
        { name: "🍎 苹果(中型)", calories: 90 },
        { name: "🍌 香蕉(中型)", calories: 100 },
        { name: "🥝 奇异果(颗)", calories: 45 },
        { name: "🥜 综合坚果(包)", calories: 160 },
        { name: "☕ 黑咖啡(杯)", calories: 5 },
        { name: "☕ 无糖拿铁(杯)", calories: 120 },
        { name: "🧋 珍奶(微糖微冰)", calories: 550 },
        { name: "🍵 无糖绿茶", calories: 0 },
        { name: "🍫 巧克力(一片)", calories: 250 }
    ]
};

function init() {
    renderCalendarPagination();
    switchQuickFoodCategory('staple'); // 默认显示主食
    updateUI();
    setupEventListeners();
}

function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendarPagination() {
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
        card.innerHTML = `
            <span class="month-label">${monthStr}</span>
            <span class="day-number">${dayNum}</span>
        `;
        calendarDays.appendChild(card);
    }
}

function switchQuickFoodCategory(category) {
    quickFoodPool.innerHTML = '';
    const foods = presetFoods[category] || [];
    foods.forEach(food => {
        const btn = document.createElement('button');
        btn.className = 'quick-food-btn';
        btn.innerHTML = `${food.name} <span>${food.calories}k</span>`;
        btn.addEventListener('click', () => {
            addMealRecord(food.name, food.calories);
        });
        quickFoodPool.appendChild(btn);
    });
}

function addMealRecord(name, calories) {
    const newMeal = { id: Date.now(), name: name, calories: calories };
    if (!allData[selectedDate]) {
        allData[selectedDate] = [];
    }
    allData[selectedDate].push(newMeal);
    saveToLocalStorage();
    updateUI();
}

function updateUI() {
    foodList.innerHTML = '';
    const todayStr = getFormattedDate(new Date());
    if (selectedDate === todayStr) {
        currentDateLabel.textContent = '今日';
    } else {
        const parts = selectedDate.split('-');
        currentDateLabel.textContent = `${parts[1]}/${parts[2]}`;
    }

    const currentMeals = allData[selectedDate] || [];

    if (currentMeals.length === 0) {
        foodList.innerHTML = '<li class="empty-msg">这天还没有记录哦，吃点什么吧！</li>';
        totalCaloriesEl.textContent = 0;
        updateProgress(0);
        return;
    }

    let totalCalories = 0;
    currentMeals.forEach((meal) => {
        totalCalories += meal.calories;
        const li = document.createElement('li');
        li.className = 'food-item';
        li.innerHTML = `
            <div class="food-info">
                <span class="name">${meal.name}</span>
                <span class="cal">${meal.calories} kcal</span>
            </div>
            <button class="btn-delete" data-id="${meal.id}">&times;</button>
        `;
        foodList.appendChild(li);
    });

    totalCaloriesEl.textContent = totalCalories;
    updateProgress(totalCalories);
}

function updateProgress(total) {
    const percentage = Math.min((total / DAILY_GOAL) * 100, 100);
    progressCircle.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(--primary-color) ${percentage}%, #e0e0e0 ${percentage}%)`;
}

function setupEventListeners() {
    foodForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = foodNameInput.value.trim();
        const calories = parseInt(foodCaloriesInput.value);
        if (!name || !calories) return;

        addMealRecord(name, calories);
        foodForm.reset();
        foodNameInput.focus();
    });

    categoryTabs.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.getAttribute('data-cat');
            switchQuickFoodCategory(cat);
        }
    });

    foodList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const idToDelete = parseInt(e.target.getAttribute('data-id'));
            allData[selectedDate] = allData[selectedDate].filter(meal => meal.id !== idToDelete);
            if (allData[selectedDate].length === 0) {
                delete allData[selectedDate];
            }
            saveToLocalStorage();
            updateUI();
        }
    });

    calendarDays.addEventListener('click', function(e) {
        const card = e.target.closest('.day-card');
        if (card) {
            selectedDate = card.getAttribute('data-date');
            document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            updateUI();
        }
    });

    btnPrevWeek.addEventListener('click', function() {
        baseDate.setDate(baseDate.getDate() - 5);
        renderCalendarPagination();
    });

    btnNextWeek.addEventListener('click', function() {
        baseDate.setDate(baseDate.getDate() + 5);
        renderCalendarPagination();
    });
}

function saveToLocalStorage() {
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
}

init();
