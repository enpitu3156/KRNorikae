// 1. 路線データに記号（symbol）を追加
const lines = [
    { name: "東海道", symbol: "TK", color: "#e66900", stations: ["東京", "湘南", "富士", "静岡", "浜松", "名古屋"] },
    { name: "中央", symbol: "CH", color: "#e69e00", stations: ["東京", "海老名", "甲府", "飯田", "名古屋", "羽島", "米原", "京都", "大阪"] },
    { name: "山陽", symbol: "SN", color: "#0062ab", stations: ["大阪", "姫路", "岡山", "広島", "山口", "小倉", "博多"] },
    { name: "東北", symbol: "TH", color: "#39b84a", stations: ["東京", "つくば", "宇都宮", "郡山", "福島", "仙台", "北上", "盛岡", "八戸", "青森"] },
    { name: "北海道", symbol: "HK", color: "#008446", stations: ["青森", "木古内", "函館北斗", "八雲", "小樽", "札幌"] },
    { name: "長野房総", symbol: "NB", color: "#b9d200", stations: ["東京", "大宮", "渋川"] },
    { name: "九州", symbol: "KS", color: "#d81e00", stations: ["博多", "久留米"] }
];

const stations = {
    "東京": { "湘南":31, "海老名":16, "つくば":40, "大宮": 19 },
    "湘南": { "富士":39, "東京": 31 },
    "富士": { "静岡":26, "湘南": 39 },
    "静岡": { "浜松":38, "富士": 26 },
    "浜松": { "名古屋":59, "静岡": 38 },
    "名古屋": { "浜松":59, "羽島":15, "飯田": 47 },
    "海老名": { "甲府":35, "東京": 16 },
    "甲府": { "飯田":33, "海老名":35 },
    "飯田": { "名古屋":47, "甲府":33 },
    "羽島": { "米原":11, "名古屋": 15 },
    "米原": { "京都":31, "羽島": 11 },
    "京都": { "大阪":22, "米原": 31 },
    "大阪": { "京都":22, "姫路": 27},
    "姫路": { "岡山":38, "大阪": 27 },
    "岡山": { "広島":58, "姫路": 38},
    "広島": { "山口":62, "岡山": 58 },
    "山口": { "小倉":42, "広島": 62 },
    "小倉": { "博多":32, "山口": 42},
    "博多": { "小倉":32, "久留米": 15 },
    "つくば": { "宇都宮":13, "東京": 40 },
    "宇都宮": { "郡山":45, "つくば": 13 },
    "郡山": { "福島":14, "宇都宮": 45 },
    "福島": { "仙台":37, "郡山": 14 },
    "仙台": { "北上":40, "福島": 37 },
    "北上": { "盛岡":20, "仙台": 40 },
    "盛岡": { "八戸":45, "北上": 20 },
    "八戸": { "青森":46, "盛岡": 45 },
    "青森": { "木古内":48, "八戸": 46 },
    "木古内": { "函館北斗":22, "青森": 48 },
    "函館北斗": { "八雲":35, "木古内": 22 },
    "八雲": { "小樽":62, "函館北斗": 35 },
    "小樽": { "札幌":15, "八雲": 62 },
    "札幌": { "小樽": 15 },
    "大宮": { "渋川":45, "東京": 19 },
    "渋川": { "大宮": 45 },
    "久留米": {"博多": 15 }
};

// ★ページ読み込み時にサジェストを自動生成
window.onload = function() {
    const datalist = document.getElementById('station-options');
    if (datalist) {
        Object.keys(stations).sort().forEach(station => {
            const option = document.createElement('option');
            option.value = station;
            datalist.appendChild(option);
        });
    }
};

function findShortestPath(start, end) {
    const distances = {};
    const prev = {};
    const visited = new Set();
    const nodes = Object.keys(stations);
    for (let station of nodes) distances[station] = Infinity;
    distances[start] = 0;

    while (true) {
        let closestStation = null;
        let shortestDistance = Infinity;
        for (let station of nodes) {
            if (!visited.has(station) && distances[station] < shortestDistance) {
                closestStation = station;
                shortestDistance = distances[station];
            }
        }
        if (closestStation === null || closestStation === end) break;
        visited.add(closestStation);
        const neighbors = stations[closestStation];
        for (let neighbor in neighbors) {
            const alt = distances[closestStation] + neighbors[neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = closestStation;
            }
        }
    }
    if (distances[end] === Infinity) return null;
    let path = [];
    let curr = end;
    while (curr !== null) {
        path.push(curr);
        curr = prev[curr] || null;
    }
    return { time: distances[end], path: path.reverse() };
}

function searchTime() {
    const start = document.getElementById('startNode').value.trim().replace(/駅$/, "");
    const end = document.getElementById('endNode').value.trim().replace(/駅$/, "");
    const resultArea = document.getElementById('result');

    if (!stations[start] || !stations[end]) {
        resultArea.innerHTML = `<p class="error-text">駅名が正しくありません。</p>`;
        return;
    }

    const result = findShortestPath(start, end);
    if (result) {
        const minutes = Math.floor(result.time / 60);
        const seconds = result.time % 60;
        let timeString = (minutes > 0) ? `${minutes}分${seconds}秒` : `${seconds}秒`;

        // ★経路表示（ナンバリング情報を含む）
        let pathHTML = result.path.map((stationName) => {
            const belongingLines = lines.filter(line => line.stations.includes(stationName));
            
            // ポップアップ用の中身を作成
            let infoHTML = belongingLines.map(line => {
                const index = line.stations.indexOf(stationName) + 1;
                const stationNumber = `${line.symbol}-${String(index).padStart(2, '0')}`;
                return `<div class="line-info"><span class="mini-dot" style="background-color:${line.color}"></span> ${line.name}: ${stationNumber}</div>`;
            }).join("");

            let dotsHTML = belongingLines.map(line => `<span class="line-dot" style="background-color: ${line.color};"></span>`).join("");

            return `
                <div class="path-station-wrapper">
                    <span class="path-station"><span class="dots-container">${dotsHTML}</span>${stationName}</span>
                    <div class="station-tooltip"><strong>${stationName}駅</strong><hr>${infoHTML}</div>
                </div>
            `;
        }).join('<span class="path-arrow">→</span>');

        resultArea.innerHTML = `
            <div class="result-card">
                <div class="result-header">最短ルート確定</div>
                <div class="result-summary">
                    <div class="result-time"><span class="label">所要時間</span><span class="value">${timeString}</span></div>
                    <div class="result-count"><span class="label">停車駅数</span><span class="value">${result.path.length}駅</span></div>
                </div>
                <div class="result-path-container">
                    <div class="label">経路詳細（駅名をタップで詳細表示）</div>
                    <div class="result-path">${pathHTML}</div>
                </div>
            </div>
        `;
    } else {
        resultArea.innerHTML = `<p class="error-text">経路が見つかりませんでした。</p>`;
    }
}