# 艾恩葛朗特攻略本（SAO Minecraft）

SAO Minecraft 中文攻略網站：第 1～3 層互動地圖、地下城地圖與攻略步驟、物品、怪物、任務、配方、職業、世界王，以及 JourneyMap／Xaero's Minimap 路點匯入匯出。

網站：https://johnnywcyin.github.io/sao-minecraft-guide/

## 資料來源

- [阿爾戈的攻略本（SAO 地圖及攻略 中文版）](https://cheng-1001.github.io/ArgoStrategyGuide/)
- [EXILED ORDER 物品百科與互動地圖](https://exiled-order.pages.dev/wiki)
- [DelayedCode SAO MC Interactive Map](https://delayedcode.github.io/SAO-MC-Interactive-Map/index.html)

標「非官方譯名」的中文名是本站自己翻譯（`raw/zh-extra-*.tsv`），有官方中文名的一律用官方名。非官方網站，遊戲資料以遊戲內為準。

## 更新資料

```bash
node tools/build.js site       # 合併資料（需要先把來源資料下載到 raw/）
node tools/fetch-images.js     # 下載新圖片
node tools/pack-images.js      # 打包圖片
node tools/build-pages.js      # 產生 GitHub Pages 用的 docs/
```
