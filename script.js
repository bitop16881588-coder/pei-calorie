// 全域狀態
let allData = JSON.parse(localStorage.getItem('calorieDataByDate')) || {};
let waterData = JSON.parse(localStorage.getItem('waterLogByDate')) || {};
let selectedDate = new Date().toISOString().split('T')[0];

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    renderCalendar();
    renderQuickFood('staple');
    updateUI();
    renderWaterGrid();
    initChart(); // 確保圖表初始化
    setupRandomFood(); // 確保盲盒按鈕綁定
    setupTabs();
}

// === 修正：圖表載入 ===
function initChart() {
    const canvas = document.getElementById('calorieLineChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['一', '二', '三', '四', '五', '六', '日'],
            datasets: [{
                label: '攝入量',
                data: [1800, 1500, 1900, 1300, 2000, 1600, 0],
                borderColor: '#2ec4b6',
                tension: 0.4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// === 修正：盲盒功能 (使用強制綁定) ===
function setupRandomFood() {
    const btn = document.getElementById('btn-random-food');
    const res = document.getElementById('random-food-result');
    if (!btn) return;

    btn.onclick = function() {
        const categories = ['staple', 'protein', 'veg', 'snack'];
        let combo = categories.map(c => presetFoods[c][Math.floor(Math.random() * presetFoods[c].length)]);
        let total = combo.reduce((sum, item) => sum + item.calories, 0);
        
        let html = combo.map(f => `${f.name} (${f.calories}k)`).join('<br>');
        res.innerHTML = `${html}<br><strong>🔥 總熱量: ${total}k</strong><br>` + 
                        `<button id="btn-apply-combo" style="cursor:pointer; background:#2ec4b6; color:white; border:none; padding:5px 10px; border-radius:5px; margin-top:5px;">一鍵寫入</button>`;
        
        document.getElementById('btn-apply-combo').onclick = () => {
            combo.forEach(f => addFood(f.name, f.calories));
            alert("已成功寫入當日餐單！");
        };
    };
}

// === 修正：選單點擊 ===
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderQuickFood(btn.dataset.cat);
        };
    });
}

// 以下保留你原本的 renderCalendar, renderQuickFood, addFood, updateUI 等函數...
// (請確保你的 script.js 檔案中原本的這些函數還在)
