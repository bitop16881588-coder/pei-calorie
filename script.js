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

const DAILY_GOAL = 2000;

// 基准日期（用于计算当前展示的一组分页日期，默认包含今天）
let baseDate = new Date();
// 选中的目标记录日期，默认是今天
let selectedDate = getFormattedDate(new Date());

let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};

function init() {
    renderCalendarPagination();
    updateUI();
    setupEventListeners();
}

function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 动态渲染类似行事历的 5 天分頁卡片
function renderCalendarPagination() {
    calendarDays.innerHTML = '';
    
    // 生成以 baseDate 为中心的 5 天日期分頁卡片
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

function updateUI() {
    foodList.innerHTML = '';
    
    // 渲染日期标签文本
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
    // 提交数据
    foodForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = foodNameInput.value.trim();
        const calories = parseInt(foodCaloriesInput.value);

        if (!name || !calories) return;

        const newMeal = { id: Date.now(), name: name, calories: calories };

        if (!allData[selectedDate]) {
            allData[selectedDate] = [];
        }

        allData[selectedDate].push(newMeal);
        saveToLocalStorage();
        updateUI();

        foodForm.reset();
        foodNameInput.focus();
    });

    // 列表删除
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

    // 点击行事历分页卡片切换日期
    calendarDays.addEventListener('click', function(e) {
        const card = e.target.closest('.day-card');
        if (card) {
            selectedDate = card.getAttribute('data-date');
            
            // 重新高亮选中的分页
            document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            updateUI();
        }
    });

    // 日期分页向左翻页（查看更早的日期）
    btnPrevWeek.addEventListener('click', function() {
        baseDate.setDate(baseDate.getDate() - 5);
        renderCalendarPagination();
    });

    // 日期分页向右翻页（查看更晚的日期）
    btnNextWeek.addEventListener('click', function() {
        baseDate.setDate(baseDate.getDate() + 5);
        renderCalendarPagination();
    });
}

function saveToLocalStorage() {
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
}

init();
