# 艾恩葛朗特攻略本（SAO Minecraft）

SAO Minecraft 中文攻略網站：第 1～3 層互動地圖、地下城地圖與攻略步驟、物品、怪物、任務、配方、職業、世界王，以及 JourneyMap／Xaero's Minimap 路點匯入匯出。

網站：https://johnnywcyin.github.io/sao-minecraft-guide/

## 資料來源

- [阿爾戈的攻略本（SAO 地圖及攻略 中文版）](https://cheng-1001.github.io/ArgoStrategyGuide/)
- [EXILED ORDER 物品百科與互動地圖](https://exiled-order.pages.dev/wiki)
- [DelayedCode SAO MC Interactive Map](https://delayedcode.github.io/SAO-MC-Interactive-Map/index.html)
- [SAO Minecraft Wiki](https://saominecraft.wiki.gg/)：繁體中文物品名、怪物行為與難度、符文表；「系統」分頁是本站根據 wiki 重新整理的摘要

中文名優先用官方名，其次用 wiki 繁中頁面的名稱（標「Wiki 譯名」），都沒有才用本站自己的翻譯（標「非官方譯名」，`raw/zh-extra-*.tsv`）。非官方網站，遊戲資料以遊戲內為準。

## 更新資料

```bash
node tools/wikigg.js           # 從 raw/wikigg/pages.json 抽出 wiki 中文名（產生 raw/wikigg-zh.json）
node tools/build.js site       # 合併資料（需要先把來源資料下載到 raw/）
node tools/fetch-images.js     # 下載新圖片
node tools/pack-images.js      # 打包圖片
python tools/make-tiles.py     # 高清樓層圖（raw/hires/floor-N-*.png）切成地圖分格
node tools/build-pages.js      # 產生 GitHub Pages 用的 docs/
```

## Cloudflare 部署（網站＋官方 API 中轉）

`wrangler.jsonc` 把整個網站（`docs/`）和官方 API 中轉（`/api/...`，程式在 `tools/cloudflare-worker.mjs`）放在同一個 Cloudflare Worker。在 Cloudflare 主控台把 Worker 連上這個 GitHub repo（建置指令留空，部署指令 `npx wrangler deploy`），之後每次 push 都會自動部署。

在 Cloudflare 版網站，「我的進度」只要填 API key。GitHub Pages 版要另外填中轉網址：`https://saominecraft.johnnywcyin.workers.dev/api`。

中轉只轉送讀取（GET）請求和少數幾個路徑，只接受本站的請求，不會儲存 API key。本機測試：`node tools/worker-dev.mjs`，開 http://localhost:8787 。
