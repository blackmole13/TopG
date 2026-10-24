const number = (value) => Number(value || 0).toLocaleString("ko-KR");
const compact = (value) => {
  const n = Number(value || 0);
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K` : number(n);
};
const box = (label, value) => {
  const el = document.createElement("div");
  el.className = "total";
  const small = document.createElement("small");
  small.textContent = label;
  const bold = document.createElement("b");
  bold.textContent = value;
  el.append(small, bold);
  return el;
};
const genreIcons = { "Hip Hop": "hip-hop.png", "R&B": "r-and-b.png", Rock: "rock.png", Pop: "pop.png", EDM: "edm.png" };
let plan;

function calculate(item) {
  const rules = plan.rules;
  const expByLevel = new Map(rules.expByLevel.map(({ level, exp }) => [level, exp]));
  const extra = item.experienceExtraPercent ?? rules.experienceMultipliers.find((entry) => entry.name === item.name)?.extraPercent ?? 0;
  let exp = 0;
  for (let level = item.currentLevel; level < item.targetLevel; level += 1) {
    const cost = expByLevel.get(level);
    if (cost === undefined) throw new Error(`Lv.${level} EXP 정보가 없습니다.`);
    exp += Math.ceil(cost * (1 + extra));
  }
  const gates = rules.promotionGates.filter((gate) => gate.level >= item.currentLevel && gate.level < item.targetLevel);
  const cards = gates.reduce((total, gate) => {
    const required = gate.level > item.currentLevel || (gate.level === item.currentLevel && item.includeCurrentPromotion);
    return total + (required ? gate.cards : 0);
  }, 0);
  return { exp, cards, hasStartingGate: gates.some((gate) => gate.level === item.currentLevel) };
}

function maximumLevel() {
  return Math.max(...plan.rules.expByLevel.map(({ level }) => level)) + 1;
}

function targetChoices(currentLevel, selectedTarget) {
  const maximum = maximumLevel();
  const choices = [...plan.rules.milestones, maximum].filter((level) => level > currentLevel);
  if (selectedTarget > currentLevel && selectedTarget <= maximum && !choices.includes(selectedTarget)) choices.push(selectedTarget);
  return [...new Set(choices)].sort((a, b) => a - b);
}

function render() {
  const list = document.getElementById("list");
  const summary = document.getElementById("summary");
  const selected = plan.artists.filter((item) => item.selected);
  const results = selected.map((item) => ({ item, result: calculate(item) }));
  const totalExp = results.reduce((sum, row) => sum + row.result.exp, 0);
  const cardsByRank = results.reduce((totals, row) => {
    if (row.result.cards > 0) totals[row.item.rank] = (totals[row.item.rank] || 0) + row.result.cards;
    return totals;
  }, {});
  summary.replaceChildren(
    box("계산 대상", `${selected.length}명`),
    box("필요 EXP", `${compact(totalExp)} (${number(totalExp)})`),
    box("SSR 카드", `${number(cardsByRank.SSR)}장`),
    box("SR 카드", `${number(cardsByRank.SR)}장`),
  );
  document.getElementById("selection-count").textContent = `${selected.length} / ${plan.artists.length}명 계산 중`;
  list.replaceChildren();
  list.className = "list";
  if (!plan.artists.length) {
    list.className = "empty";
    list.textContent = "공개된 계산 캐릭터가 없습니다.";
    return;
  }
  for (const item of plan.artists) {
    const result = calculate(item);
    const row = document.createElement("article");
    row.className = "row";
    row.setAttribute("aria-disabled", String(!item.selected));

    const toggle = document.createElement("input");
    toggle.className = "row-check";
    toggle.type = "checkbox";
    toggle.checked = item.selected;
    toggle.setAttribute("aria-label", `${item.nameKo} 계산에 포함`);
    toggle.addEventListener("change", () => { item.selected = toggle.checked; render(); });

    const identity = document.createElement("div");
    identity.className = "identity";
    if (item.localImageFile) {
      const img = document.createElement("img");
      img.className = "portrait";
      img.alt = "";
      img.src = `./${item.localImageFile.split("/").map(encodeURIComponent).join("/")}`;
      identity.append(img);
    }
    const name = document.createElement("div");
    name.className = "name";
    const title = document.createElement("b");
    title.textContent = item.nameKo;
    const meta = document.createElement("small");
    const genre = document.createElement("span");
    genre.className = "genre";
    const iconFile = genreIcons[item.genre];
    if (iconFile) {
      const icon = document.createElement("img");
      icon.src = `./images/genres/${iconFile}`;
      icon.alt = "";
      icon.title = item.genreLabel;
      genre.append(icon);
    }
    genre.setAttribute("aria-label", item.genreLabel);
    genre.title = item.genreLabel;
    meta.append(genre, document.createTextNode(`${item.role} · ${item.tier}`));
    if (item.experienceExtraPercent > 0) {
      const bonus = document.createElement("span");
      bonus.className = "exp-bonus";
      bonus.textContent = `경험치 +${Math.round(item.experienceExtraPercent * 100)}%`;
      meta.append(bonus);
    }
    name.append(title, meta);
    identity.append(name);

    const current = document.createElement("label");
    current.className = "levels current";
    const currentLabel = document.createElement("small");
    currentLabel.textContent = "시작 레벨";
    const currentInput = document.createElement("input");
    currentInput.className = "level-input";
    currentInput.type = "number";
    currentInput.min = "1";
    currentInput.max = String(maximumLevel() - 1);
    currentInput.value = String(item.currentLevel);
    currentInput.disabled = !item.selected;
    currentInput.addEventListener("change", () => {
      const next = Math.min(maximumLevel() - 1, Math.max(1, Math.trunc(Number(currentInput.value) || item.publishedCurrentLevel)));
      item.currentLevel = next;
      const choices = targetChoices(next, item.targetLevel);
      if (item.targetLevel <= next) item.targetLevel = choices[0] ?? maximumLevel();
      render();
    });
    current.append(currentLabel, currentInput);

    const target = document.createElement("label");
    target.className = "levels target";
    const targetLabel = document.createElement("small");
    targetLabel.textContent = "목표 레벨";
    const targetSelect = document.createElement("select");
    targetSelect.className = "target-select";
    const choices = targetChoices(item.currentLevel, item.targetLevel);
    for (const level of choices) {
      const option = document.createElement("option");
      option.value = String(level);
      option.textContent = `Lv.${level}`;
      option.selected = level === item.targetLevel;
      targetSelect.append(option);
    }
    targetSelect.disabled = !item.selected;
    targetSelect.addEventListener("change", () => { item.targetLevel = Number(targetSelect.value); render(); });
    target.append(targetLabel, targetSelect);

    const resource = document.createElement("div");
    resource.className = "resource";
    const expLabel = document.createElement("small");
    expLabel.textContent = "필요 EXP";
    const expValue = document.createElement("b");
    expValue.textContent = `${compact(result.exp)} EXP`;
    const cards = document.createElement("small");
    cards.style.marginTop = "6px";
    cards.textContent = `돌파 카드 ${number(result.cards)}`;
    resource.append(expLabel, expValue, cards);
    if (result.hasStartingGate) {
      const promotionToggle = document.createElement("label");
      promotionToggle.className = "promotion-toggle";
      const promotionInput = document.createElement("input");
      promotionInput.type = "checkbox";
      promotionInput.checked = item.includeCurrentPromotion;
      promotionInput.disabled = !item.selected;
      promotionInput.addEventListener("change", () => { item.includeCurrentPromotion = promotionInput.checked; render(); });
      const promotionText = document.createElement("span");
      promotionText.textContent = `Lv.${item.currentLevel} → ${item.currentLevel + 1} 돌파 포함`;
      promotionToggle.append(promotionInput, promotionText);
      resource.append(promotionToggle);
    }
    row.append(toggle, identity, current, target, resource);
    list.append(row);
  }
}

async function loadPlan() {
  const list = document.getElementById("list");
  const stamp = document.getElementById("stamp");
  try {
    const cacheBust = Date.now();
    const [response, favoritesResponse] = await Promise.all([
      fetch(`./level-plan.json?updated=${cacheBust}`, { cache: "no-store" }),
      fetch(`./favorites.json?updated=${cacheBust}`, { cache: "no-store" }),
    ]);
    if (!response.ok) throw new Error("공개 계산 정보를 불러오지 못했습니다.");
    const data = await response.json();
    if (!data.updatedAt) {
      stamp.textContent = "아직 공개된 계산 정보가 없습니다.";
      list.className = "empty";
      list.textContent = "로컬 앱의 육성 계산 페이지에서 GitHub Pages 공개 게시 버튼을 눌러주세요.";
      return;
    }
    if (!data.rules?.expByLevel || !data.rules?.promotionGates) throw new Error("이 공개 데이터는 레벨 조정 규칙이 없습니다. 로컬 앱에서 육성 계산을 다시 게시해주세요.");
    const favorites = favoritesResponse.ok ? await favoritesResponse.json() : { artists: [] };
    const preference = new Map((favorites.artists || []).map((item) => [item.id, item.priority]));
    const artists = data.artists
      .map((item) => ({ ...item, publishedCurrentLevel: item.currentLevel, selected: true, priority: preference.get(item.id) ?? Number.MAX_SAFE_INTEGER }))
      .sort((a, b) => a.priority - b.priority || a.nameKo.localeCompare(b.nameKo, "ko"));
    plan = { ...data, artists };
    stamp.textContent = "마지막 공개 게시 · " + new Date(data.updatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    document.getElementById("controls").hidden = false;
    document.getElementById("select-all").addEventListener("click", () => { plan.artists.forEach((item) => { item.selected = true; }); render(); });
    document.getElementById("select-none").addEventListener("click", () => { plan.artists.forEach((item) => { item.selected = false; }); render(); });
    render();
  } catch (error) {
    list.className = "error";
    list.textContent = error instanceof Error ? error.message : "계산 정보를 불러오지 못했습니다.";
  }
}

loadPlan();
