// 全域變數
const presetFoods = {
    staple: [{ name: "🍚 白米飯", calories: 280 }, { name: "🍱 雞胸肉餐盒", calories: 450 }, { name: "🍔 麥當勞漢堡", calories: 550 }],
    protein: [{ name: "🥚 水煮蛋", calories: 75 }, { name: "🍗 煎雞胸肉", calories: 140 }],
    veg: [{ name: "🥦 花椰菜", calories: 35 }, { name: "🥗 凱薩沙拉", calories: 350 }],
    snack: [{ name: "🍎 蘋果", calories: 90 }, { name: "🧋 珍奶", calories: 650 }]
};

// 頁面載入時強制執行初始化
document.addEventListener("DOMContentLoaded", () => {
    // 1. 初始化飲食分頁的食材
    renderQuickFood('staple');
    
    // 2. 綁定飲食分頁的分類按鈕
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderQuickFood(this.dataset.cat);
        };
    });
});

// 食材渲染函數
function renderQuickFood(cat) {
    const pool = document.getElementById('quick-food-pool');
    if (!pool) {
        console.error("錯誤：找不到 #quick-food-pool");
        return;
    }
    pool.innerHTML = ''; // 清空原本內容
    presetFoods[cat].forEach(f => {
        let b = document.createElement('button');
        b.className = 'quick-food-btn';
        b.innerHTML = `${f.name} <span>${f.calories}k</span>`;
        b.onclick = () => {
            // 這裡呼叫你原有的 addFood 功能
            if(typeof addFood === 'function') addFood(f.name, f.calories);
            else console.log("點擊了: " + f.name);
        };
        pool.appendChild(b);
    });
}

// 分頁切換功能
function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    btn.classList.add('active');
}
