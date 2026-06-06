// 获取 DOM 元素
const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const foodCaloriesInput = document.getElementById('food-calories');
const foodList = document.getElementById('food-list');
const totalCaloriesEl = document.getElementById('total-calories');
const progressCircle = document.querySelector('.progress-circle');
const datePicker = document.getElementById('date-picker');
const btnPrevDay = document.getElementById('btn-prev-day');
const btnNextDay = document.getElementById('btn-next-day');

const DAILY_GOAL = 2000;

// 当前选中的日期，默认为今天 (格式：YYYY-MM-DD)
let currentDate = getFormattedDate(new Date());

// 从 LocalStorage 读取所有数据
// 数据结构调整为：{ "2026-06-06": [{id:1, name:'苹果', calories:80}], "2026-06-07": [] }
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};

// 初始化
function init() {
    datePicker.value = currentDate;
    updateUI();
    setupEventListeners();
}

// 格式化日期为 YYYY-MM-DD
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 更新页面的核心函数
function updateUI() {
    foodList.innerHTML = '';
    
    // 获取当前日期的食物数组，如果没有记录则为空数组
    const currentMeals = allData[currentDate] || [];

    if (currentMeals.length === 0) {
        foodList.innerHTML = '<li class="empty-msg">此日期还没有记录哦，吃点什么吧！</li>';
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

// 动态计算环形进度条的百分比
function updateProgress(total) {
    const percentage = Math.min((total / DAILY_GOAL) * 100, 100);
    progressCircle.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(--primary-color) ${percentage}%, #e0e0e0 ${percentage}%)`;
}

// 事件监听器设置
function setupEventListeners() {
    // 表单提交
    foodForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = foodNameInput.value.trim();
        const calories = parseInt(foodCaloriesInput.value);

        if (!name || !calories) return;

        const newMeal = {
            id: Date.now(),
            name: name,
            calories: calories
        };

        // 如果当天还没创建数组，初始化它
        if (!allData[currentDate]) {
            allData[currentDate] = [];
        }

        allData[currentDate].push(newMeal);
        saveToLocalStorage();
        updateUI();

        foodForm.reset();
        foodNameInput.focus();
    });

    // 列表点击事件 (利用事件委托处理删除)
    foodList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const idToDelete = parseInt(e.target.getAttribute('data-id'));
            allData[currentDate] = allData[currentDate].filter(meal => meal.id !== idToDelete);
            
            // 如果当天删空了，把这个日期的 key 删掉释放空间
            if (allData[currentDate].length === 0) {
                delete allData[currentDate];
            }
            
            saveToLocalStorage();
            updateUI();
        }
    });

    // 日期选择器改变
    datePicker.addEventListener('change', function(e) {
        currentDate = e.target.value;
        updateUI();
    });

    // 前一天按钮
    btnPrevDay.addEventListener('click', function() {
        adjustDate(-1);
    });

    // 后一天按钮
    btnNextDay.addEventListener('click', function() {
        adjustDate(1);
    });
}

// 加减日期的辅助函数
function adjustDate(days) {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() + days);
    currentDate = getFormattedDate(d);
    datePicker.value = currentDate;
    updateUI();
}

// 保存到本地存储
function saveToLocalStorage() {
    localStorage.setItem('calorieDataByDate', JSON.stringify(allData));
}

// 启动
init();
