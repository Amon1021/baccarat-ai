let lastBet = null;   // "B" 或 "P"
let lastUnit = 0;    // 上一把下注單位

// =====================
// 前端金鑰驗證 + 工具初始化
// =====================

let balance = 0; // 單靴累計
const UNIT = 100; // 1u = 100
const STOP_LOSS = -UNIT * 10; // 單靴-10u
const appDiv = document.getElementById("app");

async function checkKey() {
  const saved = localStorage.getItem("roadmind_key");
  if (saved) {
    const ok = await verifyWithServer(saved);
    if (ok) return true;
    localStorage.removeItem("roadmind_key");
  }

  const input = prompt("請輸入使用金鑰：");
  if (!input) return false;

  const ok = await verifyWithServer(input);
  if (ok) {
    localStorage.setItem("roadmind_key", input);
    return true;
  }

  alert("金鑰錯誤或已失效");
  document.body.innerHTML =
    "<h2 style='color:white;text-align:center;margin-top:80px;'>未授權</h2>";
  return false;
}

async function verifyWithServer(key) {
  try {
    const res = await fetch("https://roadmind-auth.onrender.com/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });
    const data = await res.json();
    return data.ok === true;
  } catch (e) {
    alert("無法連線到驗證伺服器");
    return false;
  }
}

// =====================
// 進階百家樂 AI 計算
// =====================

function calculate(historyInput){
  try {
    const data = historyInput || "";
    if (!data.match(/^[BP]*$/)) return;

    const counts = { B: 0, P: 0, BB:0, PP:0, BP:0, PB:0 };
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 'B') counts.B++;
      else if (data[i] === 'P') counts.P++;
      if (i>0){
        const pair = data[i-1] + data[i];
        if(counts[pair]!==undefined) counts[pair]++;
      }
    }

    let confidence = 50;
    if (counts.B > counts.P) confidence += Math.min((counts.B - counts.P)*5, 50);
    else confidence += Math.min((counts.P - counts.B)*5, 50);

    let suggestion = "閒";
    const lastPair = data.slice(-2);
    if (lastPair === "BB" || lastPair === "PP") suggestion = "莊";

    let unit = UNIT;
const strategyEl = document.getElementById("strategy");
const strategy = strategyEl ? strategyEl.value : "aggressive";

if(strategy === "aggressive") {
  unit = UNIT * Math.ceil(confidence / 50);
}

    const sugEl = document.getElementById("suggestion");
    const unitEl = document.getElementById("unit");

    if(sugEl) {
      sugEl.innerText = `建議下注：${suggestion} (信心值: ${confidence}%)`;
    }
    if(unitEl) {
      unitEl.innerText = `建議下注單位：${unit}`;
    }
    
  } catch(e) {
    console.error("calculate error:", e);
  }

  lastBet = suggestion === "莊" ? "B" : "P";
  lastUnit = unit;
}

function resetBalance() {
  balance = 0;
  document.getElementById("balance").innerText = `單靴累計：${balance}`;
  alert("單靴累計已重置");
}

// 初始化
checkKey().then(ok => {
  if(ok){
    console.log("金鑰驗證成功，進階工具初始化完成");
    appDiv.style.display = "block"; // 驗證成功才顯示面板
  }
});

let history = [];

function inputResult(r){

  // 結算上一把
  if(lastBet){
    if(r === lastBet){
      balance += lastUnit;   // 贏
    } else if(r === "B" || r === "P") {
      balance -= lastUnit;   // 輸（和不算）
    }
  }

  history.push(r);

  // 立刻更新畫面（不要等 render 覆蓋）
  const balEl = document.getElementById("balance");
  if(balEl){
    balEl.innerText = `總累積：${balance} 單位`;
  }

  render();
}

function undo(){
  history.pop();
  lastBet = null;
  lastUnit = 0;
  render();
}

function resetAll(){
  history = [];
  balance = 0;
  lastBet = null;
  lastUnit = 0;

  const balEl = document.getElementById("balance");
  if(balEl){
    balEl.innerText = `總累積：0 單位`;
  }

  render();
}

function render(){
  document.getElementById("round").innerText = history.length;
  document.getElementById("balance").innerText = `總累積：${balance} 單位`;

  // 簡易路圖顯示
  const road = history.map(x=>{
    if(x==="B") return "🔴";
    if(x==="P") return "🔵";
    return "🟢";
  }).join(" ");
  document.getElementById("road").innerText = road;

  if(history.length>0){
    calculateFromHistory();
  }
}

function calculateFromHistory(){
  const str = history.filter(x => x !== "T").join("");
  calculate(str);
}

function updateBalanceUI(){
  const el = document.getElementById("balance");
  if(el){
    el.innerText = `總累積：${balance} 單位`;
  }
}
