// 获取 DOM 元素
const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const foodCaloriesInput = document.getElementById('food-calories');
const foodList = document.getElementById('food-list');
const totalCaloriesEl = document.getElementById('total-calories');
const progressCircle = document.querySelector('.progress-circle');

// 设定一个每日目标卡路里（例如：2000 kcal），用来让进度条动起来
const DAILY_GOAL = 2000;

// 从 LocalStorage 读取历史记录，如果没有则初始化为空数组
let meals = JSON.parse(localStorage.getItem('meals')) || [];

// 初始化渲染
function init() {
    updateUI();
}

// 更新页面的核心函数
function updateUI() {
    // 1. 清空列表
    foodList.innerHTML = '';

    if (meals.length === 0) {
        foodList.innerHTML = '<li class="empty-msg">今天还没有记录哦，吃点什么吧！</li>';
        totalCaloriesEl.textContent = 0;
        updateProgress(0);
        return;
    }

    // 2. 渲染每一条饮食记录
    let totalCalories = 0;
    meals.forEach((meal) => {
        totalCalories += meal.calories;

        const li = document.createElement('li');
        li.className = 'food-item';
        li.innerHTML = `
            <div class="food-info">
                <span class="name">${meal.name}</span>
                <span class="cal">${meal.calories} kcal</span>
            </div>
            <button class="btn-delete" onclick="deleteMeal(${meal.id})">&times;</button>
        `;
        foodList.appendChild(li);
    });

    // 3. 更新总卡路里和进度环
    totalCaloriesEl.textContent = totalCalories;
    updateProgress(totalCalories);
}

// 动态计算环形进度条的百分比
function updateProgress(total) {
    const percentage = Math.min((total / DAILY_GOAL) * 100, 100);
    // 修改 CSS 的 conic-gradient 角度
    progressCircle.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(--primary-color) ${percentage}%, #e0e0e0 ${percentage}%)`;
}

// 添加食物
foodForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = foodNameInput.value.trim();
    const calories = parseInt(foodCaloriesInput.value);

    if (!name || !calories) return;

    const newMeal = {
        id: Date.now(), // 用时间戳做唯一ID
        name: name,
        calories: calories
    };

    meals.push(newMeal);
    saveToLocalStorage();
    updateUI();

    // 重置表单
    foodForm.reset();
    foodNameInput.focus();
});

// 删除食物 (通过 ID)
function deleteMeal(id) {
    meals = meals.filter(meal => meal.id !== id);
    saveToLocalStorage();
    updateUI();
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('meals', JSON.stringify(meals));
}

// 启动
init();
