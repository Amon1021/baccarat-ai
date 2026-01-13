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

function calculate() {
  const historyInput = document.getElementById("history").value.trim().toUpperCase();
  const strategy = document.getElementById("strategy").value;

  if (!historyInput.match(/^[BP]*$/)) {
    alert("歷史路線只能輸入 B/P，例如 BPPB");
    return;
  }

  // 1️⃣ 全局統計
  const counts = { B: 0, P: 0, BB:0, PP:0, BP:0, PB:0 };
  for (let i = 0; i < historyInput.length; i++) {
    if (historyInput[i] === 'B') counts.B++;
    else if (historyInput[i] === 'P') counts.P++;
    if (i>0){
      const pair = historyInput[i-1] + historyInput[i];
      if(counts[pair]!==undefined) counts[pair]++;
    }
  }

  // 2️⃣ 信心值計算（進階版）
  let confidence = 50;
  if (counts.B > counts.P) confidence += Math.min((counts.B - counts.P)*5, 50);
  else confidence += Math.min((counts.P - counts.B)*5, 50);

  // 3️⃣ 決策邏輯
  let suggestion = "閒";
  const lastPair = historyInput.slice(-2);
  if (lastPair === "BB" || lastPair === "PP") suggestion = "莊";

  // 4️⃣ 下注單位建議
  let unit = UNIT;
  if(strategy === "aggressive") {
    unit = UNIT * Math.ceil(confidence / 50);
  }

  // 5️⃣ 顯示結果
  document.getElementById("suggestion").innerText =
    `建議下注：${suggestion} (信心值: ${confidence}%)`;
  document.getElementById("unit").innerText = `建議下注單位：${unit}`;

  // 6️⃣ 單靴損益模擬
  balance -= unit; 
  document.getElementById("balance").innerText = `單靴累計：${balance}`;
  if(balance <= STOP_LOSS) alert(`已達單靴停損（${STOP_LOSS}）請停止下注`);
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
  history.push(r);
  render();
}

function undo(){
  history.pop();
  render();
}

function resetAll(){
  history = [];
  balance = 0;
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
  const str = history.filter(x=>x!=="T").join("");
  document.getElementById("history").value = str; // 若你仍保留舊邏輯
  calculate();
}
