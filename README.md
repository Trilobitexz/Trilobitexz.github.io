# 📈 Taiwan Stock Quant & AI Summary (台股/美股 AI 量化分析系統)

這是一個結合 React 19、Vite、Express、Yahoo Finance API 以及 Google Gemini 2.5/2.5-flash AI 與 Google Search Grounding 技術的**全端 (Full-Stack) 智慧型股票分析與量化看盤系統**。

---

## ⚠️ 為什麼直接放到 GitHub Pages 會出現 404 / 405 錯誤？

如果您將此專案打包（例如執行了 `npm run build`）並直接部署到 **GitHub Pages** 或其他純靜態網頁託管平台，您會看到如下錯誤：
* `Failed to load resource: the server responded with a status of 404 ... /api/stocks/...`
* `Failed to load resource: the server responded with a status of 405 ... /api/stocks/analyze`

### 💡 核心原因：
1. **GitHub Pages 是「純靜態託管服務」**：它只支援瀏覽器端的前端檔案（HTML、JS、CSS、圖片），**不支援執行任何後端程式碼（也就是我們專案中的 `server.ts` Express 伺服器）**。
2. **API 需要後端伺服器運行**：當前端程式向 `/api/stocks/...` 發送請求時，GitHub Pages 會在靜態檔案目錄中去尋找名為 `0050.TW` 或 `analyze` 的資料夾或檔案。因為根本沒有這些檔案，所以：
   * `GET` 請求（如獲取股票報價）會回傳 **404 Not Found**
   * `POST` 請求（如 AI 分析）會回傳 **405 Method Not Allowed**（靜態伺服器不允許 POST）

若要正常運行本系統的所有功能（包含 Yahoo Finance 即時報價、AI 新聞分析、個股深度比較、AI 強勢股推薦），您需要**在本地運行全端伺服器**，或是**將專案部署到支援 Node.js 的全端雲端平台**。

---

## 💻 1. 如何在本地端 (Localhost) 執行專案

請在您本地的電腦（Windows、macOS 或 Linux）依照以下步驟啟動完整的全端服務：

### 步驟一：克隆專案並進入目錄
請在終端機（Terminal）中輸入：
```bash
git clone <您的 GitHub 專案倉庫網址>
cd <專案資料夾名稱>
```

### 步驟二：安裝專案套件依賴
本專案使用 npm 作為套件管理器：
```bash
npm install
```

### 步驟三：設定環境變數 (.env)
1. 在專案根目錄下，複製 `.env.example` 檔案並重新命名為 `.env`：
   ```bash
   cp .env.example .env
   ```
2. 使用文字編輯器打開 `.env` 檔案，填入您的 Google Gemini API Key：
   ```env
   GEMINI_API_KEY=您的_GEMINI_API_KEY_填在這裡
   ```
   > 💡 **如何取得免費的 Gemini API Key？**  
   > 您只需前往 [Google AI Studio](https://aistudio.google.com/)，登入 Google 帳號後點擊 **"Create API Key"** 即可免費建立一組。

### 步驟四：啟動開發伺服器
```bash
npm run dev
```
啟動成功後，終端機會顯示類似以下的訊息：
```text
Server running on http://localhost:3000
```

### 步驟五：開始看盤！
打開您的瀏覽器，造訪：**[http://localhost:3000](http://localhost:3000)**，即可開始使用完整功能！

---

## 🌐 2. 如何將此全端專案「免費部署上線」？

如果您想要讓其他人可以透過網址線上造訪您的網站，您不能使用 GitHub Pages。建議將專案部署到支援 Node.js / Express 的雲端平台。以下推薦幾個最容易上手且支援免費額度的平台：

### 🎯 推薦一：Zeabur (極力推薦 🇹🇼)
Zeabur 是近期在台灣開源與前端社群最熱門的託管平台，非常適合部署全端與 Express 專案：
1. 註冊並登入 [Zeabur](https://zeabur.com/)（可直接使用 GitHub 帳號登入）。
2. 點擊 **"Create Project"**。
3. 點擊 **"Deploy New Service"** ➡️ **"Git"** ➡️ 授權並選擇您這個股票專案的 GitHub Repository。
4. Zeabur 會自動偵測 `package.json` 中的 `scripts`，並自動使用安裝與編譯環境，極速完成部署。
5. **設定環境變數**：在部署的服務設定中，找到 **"Variables"**，新增一組環境變數：
   * Key: `GEMINI_API_KEY`
   * Value: `(您的 Gemini API Key)`
6. 點擊 **"Generate Domain"** 產生一個公網網址，即可在線上完美造訪！

### 🎯 推薦二：Render
Render 是一個非常流行且免費起步的雲端託管服務：
1. 註冊並登入 [Render](https://render.com/)。
2. 點擊 **"New +"** ➡️ 選擇 **"Web Service"**。
3. 連結您的 GitHub 帳號並選取本專案。
4. 填寫部署資訊：
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
5. 展開 **"Advanced"** 部分，點擊 **"Add Environment Variable"**：
   * Key: `GEMINI_API_KEY`
   * Value: `(您的 Gemini API Key)`
6. 點擊 **"Create Web Service"**，Render 將為您構建並託管此應用。

### 🎯 推薦三：Railway
1. 登入 [Railway](https://railway.app/)。
2. 點擊 **"New Project"** ➡️ **"Deploy from GitHub repo"**。
3. 選擇此專案並點擊 Deploy。
4. 在專案的 **Variables** 標籤內設置 `GEMINI_API_KEY`。
5. Railway 將自動建立公有域名供您存取。

---

## 🛠️ 專案技術細節

* **前端框架**：React 19 + TypeScript + Vite + Tailwind CSS (優雅、流暢排版與寬裕的負空間設計)
* **後端伺服器**：Express (Port 3000)，利用 Vite Middleware 將前後端服務無縫整合至單一連接埠
* **數據來源**：透過 `yahoo-finance2` API 即時擷取台股與美股的詳細行情、歷史 K 線與個股資料。內建「防限制（Rate Limit）雙重 Failover 機制」，如果 Yahoo API 暫時不可用，會自動降級抓取 Google Finance 或產生高度擬真的量化 Mock 數據，確保系統面不中斷
* **AI 大模型**：採用 Google Gemini 2.5-flash 模型，利用其內置的 Google Search Grounding (聯網搜尋功能)，提供最新的市場財經新聞、自動情緒傾向判斷，以及專業的投資展望量化綜合評估

---

祝您投資順利，波段滿載！🚀
