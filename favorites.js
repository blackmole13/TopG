async function renderPublishedFavorites() {
  const list = document.getElementById("list");
  const stamp = document.getElementById("stamp");
  try {
    const response = await fetch(`./favorites.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error();
    const data = await response.json();
    list.replaceChildren();
    if (!data.updatedAt) {
      list.className = "empty";
      list.textContent = "아직 공개된 선호 순위가 없습니다. 로컬 앱의 선호 캐릭터 화면에서 공개 게시를 진행해주세요.";
      return;
    }
    stamp.textContent = `마지막 게시 · ${new Date(data.updatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
    if (!data.artists?.length) {
      list.className = "empty";
      list.textContent = "공개된 선호 캐릭터가 없습니다.";
      return;
    }
    list.className = "timeline-scroll";
    const chart = document.createElement("div");
    chart.className = "timeline";
    const corner = document.createElement("div");
    corner.className = "timeline-head";
    corner.textContent = "선호 순위 / 시즌";
    chart.append(corner);
    const seasons = data.seasons ?? [];
    seasons.forEach((season) => {
      const head = document.createElement("div");
      head.className = "timeline-head";
      head.textContent = season;
      head.title = season;
      chart.append(head);
    });
    for (const artist of data.artists.slice().sort((a, b) => a.priority - b.priority)) {
      const label = document.createElement("div");
      label.className = "timeline-label";
      const priority = document.createElement("span");
      priority.className = "priority";
      priority.textContent = String(artist.priority);
      const image = document.createElement("img");
      image.className = "photo";
      image.alt = "";
      image.src = `./${artist.localImageFile.split("/").map(encodeURIComponent).join("/")}`;
      const identity = document.createElement("span");
      identity.className = "timeline-identity";
      const name = document.createElement("b");
      name.textContent = artist.nameKo;
      const meta = document.createElement("small");
      meta.textContent = [artist.tier, artist.rank, artist.role].join(" · ");
      identity.append(name, meta);
      label.append(priority, image, identity);
      chart.append(label);
      const active = new Set(artist.activeSeasons ?? []);
      const battle = new Set(artist.battleSeasons ?? []);
      const album = new Map((artist.albumSeasons ?? []).map((item) => [item.season, item.role]));
      if (!artist.battleSeasons && !artist.albumSeasons) active.forEach((index) => battle.add(index));
      seasons.forEach((season, index) => {
        const cell = document.createElement("span");
        cell.className = "timeline-cell";
        const battleBar = document.createElement("i");
        battleBar.className = battle.has(index) ? "battle active" : "battle";
        const albumBar = document.createElement("i");
        const albumRole = album.get(index);
        albumBar.className = albumRole ? "album active" : "album";
        if (albumRole && albumRole !== album.get(index - 1)) albumBar.textContent = albumRole;
        cell.title = `${season} · ${battle.has(index) ? "전투조" : "전투조 미편성"} · ${albumRole ? `음반조 ${albumRole}` : "음반조 미편성"}`;
        cell.append(battleBar, albumBar);
        chart.append(cell);
      });
    }
    list.append(chart);
    const note = document.createElement("div");
    note.className = "timeline-note";
    note.textContent = "위쪽은 전투조, 아래쪽은 음반조 편성 기간입니다. 음반조 포지션은 등록되거나 바뀐 시즌에만 표시합니다.";
    list.append(note);
  } catch {
    list.className = "error";
    list.textContent = "선호 순위를 불러오지 못했습니다.";
  }
}

renderPublishedFavorites();
