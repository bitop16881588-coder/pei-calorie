(function(){
  "use strict";
  const KEY="dailycal_v1";
  const WEEKDAYS=["一","二","三","四","五","六","日"];
  const FOODS={
    staple:[["白飯一碗",280],["糙米飯一碗",250],["吐司一片",90],["地瓜一條",120],["麵條一碗",300],["水餃 10顆",420],["蛋餅",250],["飯糰",350]],
    protein:[["煎雞腿",250],["滷雞腿",230],["水煮蛋",75],["荷包蛋",110],["鮭魚一片",200],["雞胸肉",165],["牛奶一杯",130],["無糖豆漿",80]],
    veg:[["燙青菜",50],["生菜沙拉",60],["番茄",30],["花椰菜",40],["玉米一根",90],["菇類",35],["海帶",25],["味噌湯",60]],
    snack:[["蘋果",95],["香蕉",105],["芭樂",70],["珍珠奶茶",500],["洋芋片(小)",150],["黑巧克力",150],["餅乾兩片",100],["無糖優格",90]]
  };
  const LUCKY=[
    {m:"雞胸肉 + 糙米飯 + 燙青菜",c:480},
    {m:"鮭魚 + 地瓜 + 花椰菜",c:520},
    {m:"滷雞腿 + 白飯 + 生菜沙拉",c:600},
    {m:"無糖豆漿 + 全麥吐司 + 水煮蛋",c:360}
  ];

  let data=load();
  let selected=new Date();
  let weekStart=startOfWeek(new Date());
  let curCat="staple";

  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw){const d=JSON.parse(raw); d.records=d.records||{}; d.water=d.water||{}; d.goal=d.goal||2000; return d;}
    }catch(e){}
    return {records:{},water:{},goal:2000,weight:"",height:""};
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){}}

  function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function startOfWeek(d){const x=new Date(d);const off=(x.getDay()+6)%7;x.setDate(x.getDate()-off);x.setHours(0,0,0,0);return x;}
  function sameDay(a,b){return key(a)===key(b);}
  function dayItems(d){return data.records[key(d)]||[];}
  function dayTotal(d){return dayItems(d).reduce((s,i)=>s+i.cal,0);}

  let toastTimer;
  function toast(msg){
    const el=document.getElementById("toast");
    if(!el) return; el.textContent=msg;el.classList.add("show");
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1800);
  }
  window.toast = toast;

  // 主導航分頁切換
  function switchMainTab(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.app-nav .nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    btn.classList.add('active');
  }
  window.switchMainTab = switchMainTab;

  // 🌟 綠拿鐵「生動攪拌與精確色彩對接」核心邏輯
  function calculateGreenSmoothie() {
    const vegSelect = document.getElementById('green-veg');
    const fruitSelect = document.getElementById('green-fruit');
    const liquidSelect = document.getElementById('green-liquid');

    const total = (parseInt(vegSelect.value) || 0) + (parseInt(fruitSelect.value) || 0) + (parseInt(liquidSelect.value) || 0);

    // 抓取被選擇食材的特色顏色
    const vegColor = vegSelect.options[vegSelect.selectedIndex].getAttribute('data-color');
    const fruitColor = fruitSelect.options[fruitSelect.selectedIndex].getAttribute('data-color');

    const blender = document.getElementById('my-blender');
    const juice = document.getElementById('juice-layer');
    const resBox = document.getElementById('green-result');

    // 1. 食材倒入果汁機 (重置高度、上色)
    blender.classList.remove('working');
    juice.style.height = '40%';
    juice.style.backgroundColor = vegColor; // 初始為蔬菜顏色

    toast('🥬 食材已丟入果汁機，準備攪拌...');

    // 2. 啟動果汁機攪拌動畫
    setTimeout(() => {
        blender.classList.add('working');
        juice.style.height = '85%';
        // 攪打混合後的調和色 (固定成好看的微黃綠拿鐵色，完美調和)
        juice.style.backgroundColor = '#7CB342'; 
    }, 800);

    // 3. 攪拌完成，顯示報告
    setTimeout(() => {
        blender.classList.remove('working');
        resBox.innerHTML = `<div class="big">共 ${total} kcal</div><div class="sub">✨ 攪打完成！這杯綠拿鐵非常新鮮</div><button class="btn ghost" id="add-green-btn" style="margin-top:8px">🧪 導入今日餐單</button>`;
        resBox.classList.add('show');
        
        document.getElementById('add-green-btn').onclick = () => addItem("自製綠拿鐵特調", total);
    }, 2200);
  }
  window.calculateGreenSmoothie = calculateGreenSmoothie;

  function renderCalendar(){
    const box=document.getElementById("days"); if(!box) return; box.innerHTML="";
    const today=new Date();
    for(let i=0;i<7;i++){
      const d=new Date(weekStart);d.setDate(d.getDate()+i);
      const b=document.createElement("button"); b.className="day";
      if(sameDay(d,today))b.classList.add("today");
      if(sameDay(d,selected))b.classList.add("sel");
      b.innerHTML='<div class="wk">'+WEEKDAYS[i]+'</div><div class="dt">'+d.getDate()+'</div>'+(dayTotal(d)>0?'<span class="dot"></span>':'');
      b.addEventListener("click",()=>{selected=new Date(d);renderAll();});
      box.appendChild(b);
    }
  }

  function renderLabel(){
    const d=selected,today=new Date();
    const txt=(d.getMonth()+1)+" 月 "+d.getDate()+" 日(週"+WEEKDAYS[(d.getDay()+6)%7]+")";
    const el = document.getElementById("sel-label");
    if(el) el.textContent=sameDay(d,today)?("今天 · "+txt):("記錄中 · "+txt);
  }

  const R=92, C=2*Math.PI*R;
  function renderRing(){
    const ringBar=document.getElementById("ring-bar"); if(!ringBar) return;
    ringBar.style.strokeDasharray=C;
    const total=dayTotal(selected),goal=data.goal||2000;
    const pct=goal>0?total/goal:0,shown=Math.min(pct,1);
    ringBar.style.strokeDashoffset=C*(1-shown);
    ringBar.style.stroke=pct<=0.7?"var(--primary)":(pct<=1?"var(--accent)":"var(--coral)");
    document.getElementById("ring-num").textContent=total;
    document.getElementById("ring-of").textContent="/ "+goal+" kcal";
    document.getElementById("ring-over").textContent=total>goal?("超過 "+(total-goal)+" kcal"):"";
  }

  function renderList(){
    const ul=document.getElementById("list"); if(!ul) return; const items=dayItems(selected); ul.innerHTML="";
    if(!items.length){ul.innerHTML='<div class="empty">這天還沒有記錄，點快捷食物或手動添加吧。</div>';return;}
    items.forEach(it=>{
      const li=document.createElement("li");
      li.innerHTML='<span class="li-name"></span><span class="li-cal">'+it.cal+' kcal</span><button class="del">×</button>';
      li.querySelector(".li-name").textContent=it.name;
      li.querySelector(".del").addEventListener("click",()=>{removeItem(it.id);});
      ul.appendChild(li);
    });
  }

  function renderPool(){
    const pool=document.getElementById("pool"); if(!pool) return; pool.innerHTML="";
    FOODS[curCat].forEach(([nm,kc])=>{
      const b=document.createElement("button"); b.className="chip";
      b.innerHTML='<span class="nm"></span><span class="kc">'+kc+' kcal</span>';
      b.querySelector(".nm").textContent=nm;
      b.addEventListener("click",()=>addItem(nm,kc));
      pool.appendChild(b);
    });
  }

  let chart;
  function weekTotals(){
    const arr=[]; for(let i=0;i<7;i++){const d=new Date(weekStart);d.setDate(d.getDate()+i);arr.push(dayTotal(d));} return arr;
  }
  function renderStats(){
    const totals=weekTotals(); const recorded=totals.filter(v=>v>0);
    const avg=recorded.length?Math.round(recorded.reduce((a,b)=>a+b,0)/recorded.length):0;
    const max=totals.length?Math.max(...totals):0;
    if(document.getElementById("s-avg")) document.getElementById("s-avg").innerHTML=avg+'<small>kcal</small>';
    if(document.getElementById("s-days")) document.getElementById("s-days").innerHTML=recorded.length+'<small>天</small>';
    if(document.getElementById("s-max")) document.getElementById("s-max").innerHTML=max+'<small>kcal</small>';
  }
  function renderChart(){
    const canvas = document.getElementById("chart"); if(!canvas || !window.Chart)return;
    const totals=weekTotals(),goal=data.goal||2000;
    if(!chart){
      chart=new Chart(canvas,{
        type:"line",
        data:{labels:WEEKDAYS.slice(),datasets:[
          {label:"攝取",data:totals,borderColor:"#2F8F5B",backgroundColor:"rgba(47,143,91,.12)",fill:true,tension:.35,pointRadius:4,pointBackgroundColor:"#2F8F5B",borderWidth:2},
          {label:"目標",data:totals.map(()=>goal),borderColor:"#FF9F1C",borderDash:[5,5],pointRadius:0,borderWidth:1.5,fill:false}
        ]},
        options:{responsive:true,maintainAspectRatio:false,
          plugins:{legend:{labels:{boxWidth:12,font:{size:11},color:"#6E7B73"}}},
          scales:{y:{beginAtZero:true,grid:{color:"#EEF2EC"},ticks:{font:{size:11},color:"#6E7B73"}},x:{grid:{display:false},ticks:{font:{size:11},color:"#6E7B73"}}}
        }
      });
    }else{
      chart.data.datasets[0].data=totals; chart.data.datasets[1].data=totals.map(()=>goal); chart.update();
    }
  }

  function renderWater(){
    const box=document.getElementById("water"); if(!box) return; const cups=8; const count=Math.round((data.water[key(selected)]||0)/250); box.innerHTML="";
    for(let i=0;i<cups;i++){
      const c=document.createElement("button"); c.className="cup"+(i<count?" full":""); c.textContent="💧";
      c.addEventListener("click",()=>{
        const newCount=(i+1===count)?i:i+1; data.water[key(selected)]=newCount*250;save();renderWater();
      });
      box.appendChild(c);
    }
    if(document.getElementById("water-ml")) document.getElementById("water-ml").textContent=count*250;
  }

  function addItem(name,cal){
    const k=key(selected); if(!data.records[k])data.records[k]=[];
    data.records[k].push({id:Date.now()+""+Math.floor(Math.random()*1000),name:name,cal:cal});
    save();renderAll();toast("已添加 "+name+" · "+cal+" kcal");
  }
  function removeItem(id){
    const k=key(selected); data.records[k]=(data.records[k]||[]).filter(i=>i.id!==id);
    if(!data.records[k].length)delete data.records[k]; save();renderAll();
  }

  function renderAll(){
    renderCalendar();renderLabel();renderRing();renderList();renderStats();renderChart();renderWater();
  }

  document.getElementById("prev-week")?.addEventListener("click",()=>{weekStart.setDate(weekStart.getDate()-7);renderAll();});
  document.getElementById("next-week")?.addEventListener("click",()=>{weekStart.setDate(weekStart.getDate()+7);renderAll();});

  document.getElementById("tabs")?.addEventListener("click",e=>{
    const t=e.target.closest(".tab");if(!t)return;
    curCat=t.dataset.cat; document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t)); renderPool();
  });

  function submitManual(){
    const nameEl=document.getElementById("f-name"),calEl=document.getElementById("f-cal");
    const name=nameEl.value.trim(),cal=parseInt(calEl.value,10);
    if(!name){toast("請輸入食物名稱");nameEl.focus();return;}
    if(!cal||cal<1){toast("請輸入正確的卡路里");calEl.focus();return;}
    addItem(name,cal);nameEl.value="";calEl.value="";nameEl.focus();
  }
  document.getElementById("add-manual")?.addEventListener("click",submitManual);

  document.getElementById("calc-tdee")?.addEventListener("click",()=>{
    const w=parseFloat(document.getElementById("t-weight").value),h=parseFloat(document.getElementById("t-height").value);
    if(!w||!h){toast("請先輸入體重與身高");return;}
    const bmr=Math.round(10*w+6.25*h-5*30+5); const tdee=Math.round(bmr*1.375); const cut=Math.max(1200,tdee-400);
    const box=document.getElementById("tdee-result");
    box.innerHTML=`<div class="big">約 ${tdee} kcal</div><div class="sub">每日消耗粗估</div><button class="btn ghost" id="apply-goal" style="margin-top:8px">套用為目標</button>`;
    box.classList.add("show");
    document.getElementById("apply-goal").onclick=()=>{ data.goal=cut; save(); renderRing(); renderChart(); toast("目標已更新！"); };
  });

  document.getElementById("lucky-btn")?.addEventListener("click",()=>{
    const pick=LUCKY[Math.floor(Math.random()*LUCKY.length)];
    const box=document.getElementById("lucky-result");
    box.innerHTML=`<div class="meal">${pick.m}</div><div class="sub">約 ${pick.c} kcal</div><button class="btn ghost" id="add-lucky">導入餐單</button>`;
    box.classList.add("show");
    document.getElementById("add-lucky").onclick=()=>addItem(pick.m,pick.c);
  });

  renderPool(); renderAll();
})();
