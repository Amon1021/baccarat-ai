// 前端金鑰驗證 + 工具初始化
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

// 初始化工具
if (checkKey()) {
  render(); // 你的工具原本 render() 函式
}
