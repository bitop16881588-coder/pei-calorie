(function(){
  "use strict";
  const KEY = "dailycal_v1";
  const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
  
  // 食物清單
  const FOODS = {
    staple: [["白飯一碗", 280], ["糙米飯一碗", 250], ["吐司一片", 90], ["地瓜一條", 120], ["麵條一碗", 300], ["水餃 10顆", 420], ["蛋餅", 250], ["飯糰", 350]],
    protein: [["煎雞腿", 250], ["滷雞腿", 230], ["水煮蛋", 75], ["荷包蛋", 110], ["鮭魚一片", 200], ["雞胸肉", 165], ["牛奶一杯", 130], ["無糖豆漿", 80]],
    veg: [["燙青菜", 50], ["生菜沙拉", 60], ["番茄", 30], ["花椰菜", 40], ["玉米一根", 90], ["菇類", 35], ["海帶", 25], ["味噌湯", 60]],
    snack: [["蘋果", 95], ["香蕉", 105], ["芭樂", 70], ["珍珠奶茶", 500], ["洋芋片(小)", 150], ["黑巧克力", 150], ["餅乾兩片", 100], ["無糖優格", 90]]
  };
  const LUCKY = [{m: "雞胸肉 + 糙米飯 + 燙青菜", c: 480}, {m: "鮭魚 + 地瓜 + 花椰菜", c: 520}, {m: "滷雞腿 + 白飯 + 生菜沙拉", c: 600}, {m: "無糖豆漿 + 全麥吐司 + 水煮蛋", c: 360}];

  let data = load();
  let selected = new Date();
  let weekStart = startOfWeek(new Date());
  let curCat = "staple";

  // 核心函數
  function load() {
    try { const raw = localStorage.getItem(KEY); if(raw) return JSON.parse(raw); } catch(e) {}
    return {records:{}, water:{}, goal:2000};
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e) {} }
  function key(d) { return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
  function startOfWeek(d) { const x = new Date(d); const off = (x.getDay()+6)%7; x.setDate(x.getDate()-off); x.setHours(0,0,0,0); return x; }
  function sameDay(a, b) { return key(a) === key(b); }
  function dayItems(d) { return data.records[key(d)] || []; }
  function dayTotal(d) { return dayItems(d).reduce((s, i) => s + i.cal, 0); }
  function toast(msg) { const el = document.getElementById("toast"); if(el) { el.textContent = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 1800); } }
  window.toast = toast;

  // 分頁切換
  window.switchMainTab = function(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.app-nav .nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    btn.classList.add('active');
  };

  // 綠拿鐵動畫
  window.calculateGreenSmoothie = function() {
    const total = parseInt(document.getElementById('green-veg').value) + parseInt(document.getElementById('green-fruit').value) + parseInt(document.getElementById('green-liquid').value);
    const blender = document.getElementById('my-blender');
    const juice = document.getElementById('juice-layer');
    blender.classList.add('working');
    juice.style.height = '85%';
    juice.style.backgroundColor = '#7CB342';
    setTimeout(() => {
        blender.classList.remove('working');
        const resBox = document.getElementById('green-result');
        resBox.innerHTML = `<div>✨ 共 ${total} kcal <button class="btn ghost" id="add-green">導入</button></div>`;
        resBox.classList.add('show');
        document.getElementById('add-green').onclick = () => addItem("綠拿鐵", total);
    }, 2000);
  };

  // 圖表渲染 (修正版)
  function renderChart() {
    const canvas = document.getElementById("chart");
    if(!canvas) return;
    if(window.myChart) window.myChart.destroy();
    const totals = []; for(let i=0; i<7; i++){ const d = new Date(weekStart); d.setDate(d.getDate()+i); totals.push(dayTotal(d)); }
    window.myChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels: WEEKDAYS, datasets: [{ label: '卡路里', data: totals, borderColor: '#2F8F5B', backgroundColor: 'rgba(47,143,91,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // 其他渲染函數 (renderCalendar, renderLabel, renderRing, renderList, renderPool, renderStats, renderWater 等)
  // ...請保留你原本代碼中這些函數的內容...
  
  function renderAll() {
    renderCalendar(); renderLabel(); renderRing(); renderList(); renderStats(); renderWater(); renderChart();
  }

  // 事件綁定
  document.getElementById("prev-week")?.addEventListener("click", () => { weekStart.setDate(weekStart.getDate()-7); renderAll(); });
  document.getElementById("next-week")?.addEventListener("click", () => { weekStart.setDate(weekStart.getDate()+7); renderAll(); });
  document.getElementById("tabs")?.addEventListener("click", e => { const t = e.target.closest(".tab"); if(t) { curCat = t.dataset.cat; document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === t)); renderPool(); } });
  document.getElementById("add-manual")?.addEventListener("click", () => { addItem(document.getElementById("f-name").value, parseInt(document.getElementById("f-cal").value)); });

  renderPool(); renderAll();
})();
