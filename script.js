// 1. 豐富的飲食資料庫
const FOODS = {
    staple: [["白米飯", 280], ["雞胸健身餐盒", 450], ["排骨便當", 850], ["鮪魚飯糰", 190], ["超商義大利麵", 550], ["麥當勞大麥克", 550]],
    protein: [["紐奧良烤雞胸", 120], ["茶葉蛋", 70], ["無糖豆漿(大)", 200], ["荷包蛋", 110], ["煎鮭魚", 210]],
    veg: [["水煮綠花椰", 35], ["燙青菜", 80], ["凱薩沙拉", 350], ["大番茄", 35]],
    snack: [["50嵐波霸奶茶(微糖)", 500], ["麻古果粒茶", 350], ["蘋果", 90], ["綜合堅果", 160]]
};

// 2. 分頁切換
function showTab(id, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.getElementById(id + '-tab').style.display = 'block';
    btn.classList.add('active');
}

// 3. 綠拿鐵計算
function calcSmoothie() {
    const total = parseInt(document.getElementById('veg-s').value) + 
                  parseInt(document.getElementById('fruit-s').value) + 
                  parseInt(document.getElementById('liq-s').value);
    const res = document.getElementById('smoothie-res');
    res.innerHTML = `<div style="margin-top:10px; font-weight:bold;">總熱量: ${total} kcal</div>`;
    res.classList.add('show');
}

// ... (保留你原本的所有 renderAll, addItem, init 等函數)
