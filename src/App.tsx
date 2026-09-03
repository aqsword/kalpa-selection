import { useMemo, useState } from "react";
import { songs } from "./data/songs";
import {
  DIFFICULTIES,
  getCandidates,
  getSongCharts,
  pickRandomCandidate,
  type Difficulty,
  type RandomSelection,
} from "./selection";

const LEVELS = Array.from({ length: 20 }, (_, index) => index + 1);
const BAN_STORAGE_KEY = "kalpa-selection:banned-song-ids:v1";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  NORMAL: "Normal",
  HARD: "Hard",
  COSMOS: "Cosmos",
  ASTRA: "Astra",
};

function getInitialBannedIds(): string[] {
  try {
    const saved = window.localStorage.getItem(BAN_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function App() {
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [pack, setPack] = useState("");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const [bannedIds, setBannedIds] = useState<string[]>(getInitialBannedIds);
  const [selection, setSelection] = useState<RandomSelection | null>(null);

  const composers = useMemo(
    () => [...new Set(songs.map((song) => song.composer))].sort((a, b) => a.localeCompare(b)),
    [],
  );
  const packs = useMemo(
    () => [...new Set(songs.map((song) => song.pack))].sort((a, b) => a.localeCompare(b)),
    [],
  );
  const filters = useMemo(
    () => ({ query, composer, pack, difficulties, levels }),
    [query, composer, pack, difficulties, levels],
  );
  const bannedSet = useMemo(() => new Set(bannedIds), [bannedIds]);
  const visibleSongs = useMemo(() => getCandidates(songs, filters), [filters]);
  const candidates = useMemo(
    () => getCandidates(songs, filters, bannedSet),
    [filters, bannedSet],
  );
  const hasFilters = Boolean(
    query || composer || pack || difficulties.length || levels.length,
  );

  function updateFilter(update: () => void): void {
    update();
    setSelection(null);
  }

  function resetFilters(): void {
    setQuery("");
    setComposer("");
    setPack("");
    setDifficulties([]);
    setLevels([]);
    setSelection(null);
  }

  function toggleBan(songId: string): void {
    const nextIds = toggleValue(bannedIds, songId);
    setBannedIds(nextIds);
    window.localStorage.setItem(BAN_STORAGE_KEY, JSON.stringify(nextIds));
    if (selection?.song.id === songId) {
      setSelection(null);
    }
  }

  function drawSong(): void {
    setSelection(pickRandomCandidate(candidates));
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="KALPA Selection トップ">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>KALPA <strong>SELECTION</strong></span>
        </a>
        <p>{songs.length} songs loaded</p>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">PLAY SOMETHING UNEXPECTED</p>
            <h1 id="page-title">次の一曲を、<br /><em>偶然</em>にまかせる。</h1>
          </div>
          <p className="hero-copy">
            条件を絞って、候補からランダムに選出。<br />今日は何を叩く？
          </p>
        </section>

        <section className="workspace" aria-label="曲を選ぶ">
          <aside className="filter-panel">
            <div className="panel-heading">
              <div>
                <span className="section-number">01</span>
                <h2>条件を選ぶ</h2>
              </div>
              {hasFilters && (
                <button className="text-button" type="button" onClick={resetFilters}>
                  クリア
                </button>
              )}
            </div>

            <label className="field search-field">
              <span>曲名</span>
              <span className="search-control">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => updateFilter(() => setQuery(event.target.value))}
                  placeholder="曲名で検索"
                />
                <span aria-hidden="true">⌕</span>
              </span>
            </label>

            <div className="two-column-fields">
              <label className="field">
                <span>作曲者</span>
                <select
                  value={composer}
                  onChange={(event) => updateFilter(() => setComposer(event.target.value))}
                >
                  <option value="">すべて</option>
                  {composers.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <label className="field">
                <span>パック</span>
                <select
                  value={pack}
                  onChange={(event) => updateFilter(() => setPack(event.target.value))}
                >
                  <option value="">すべて</option>
                  {packs.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
            </div>

            <fieldset className="filter-group">
              <legend>難易度 <small>複数選択可</small></legend>
              <div className="difficulty-options">
                {DIFFICULTIES.map((difficulty) => (
                  <label
                    className={`difficulty-option difficulty-${difficulty.toLowerCase()}`}
                    key={difficulty}
                  >
                    <input
                      type="checkbox"
                      checked={difficulties.includes(difficulty)}
                      onChange={() => updateFilter(() =>
                        setDifficulties(toggleValue(difficulties, difficulty)),
                      )}
                    />
                    <span>{DIFFICULTY_LABELS[difficulty]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="filter-group level-group">
              <legend>レベル <small>複数選択可</small></legend>
              <div className="level-grid">
                {LEVELS.map((level) => (
                  <label key={level}>
                    <input
                      type="checkbox"
                      checked={levels.includes(level)}
                      onChange={() => updateFilter(() => setLevels(toggleValue(levels, level)))}
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
              <p className="field-note">ASTRA選択時は 1〜4 が星数になります。</p>
            </fieldset>
          </aside>

          <section className="draw-panel" aria-labelledby="draw-title">
            <div className="panel-heading light-heading">
              <div>
                <span className="section-number">02</span>
                <h2 id="draw-title">ランダム選出</h2>
              </div>
              <span className="candidate-count">{candidates.length} 曲が候補</span>
            </div>

            <div className={`selection-display${selection ? " has-selection" : ""}`} aria-live="polite">
              {selection ? (
                <>
                  <p className="selection-kicker">YOUR NEXT TRACK</p>
                  <h3>{selection.song.title}</h3>
                  <p className="selection-composer">{selection.song.composer}</p>
                  <div className="selection-meta">
                    <span className={`chart-badge badge-${selection.chart.difficulty.toLowerCase()}`}>
                      {selection.chart.difficulty}
                    </span>
                    <strong>{selection.chart.difficulty === "ASTRA" ? "★" : "Lv."}{selection.chart.level}</strong>
                    <span>{selection.song.pack}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="roulette-mark" aria-hidden="true">✦</span>
                  <p>{candidates.length > 0 ? "条件を決めたら、選出ボタンを押してください。" : "条件に合う選出候補がありません。"}</p>
                </>
              )}
            </div>

            <button
              className="draw-button"
              type="button"
              onClick={drawSong}
              disabled={candidates.length === 0}
            >
              <span>{selection ? "もう一度選ぶ" : "ランダムに選ぶ"}</span>
              <span aria-hidden="true">→</span>
            </button>
            <p className="draw-note">BANした曲は選出候補から除外されます。</p>
          </section>
        </section>

        <section className="library" aria-labelledby="library-title">
          <div className="library-heading">
            <div>
              <span className="section-number">03</span>
              <h2 id="library-title">曲一覧</h2>
            </div>
            <p><strong>{visibleSongs.length}</strong> / {songs.length} 曲</p>
          </div>

          {visibleSongs.length > 0 ? (
            <div className="song-list">
              {visibleSongs.map(({ song }) => {
                const isBanned = bannedSet.has(song.id);
                return (
                  <article className={`song-card${isBanned ? " is-banned" : ""}`} key={song.id}>
                    <div className="song-copy">
                      <span className="pack-label">{song.pack}</span>
                      <h3>{song.title}</h3>
                      <p>{song.composer}</p>
                    </div>
                    <div className="chart-list" aria-label={`${song.title}の譜面`}>
                      {getSongCharts(song).map((chart) => (
                        <span className={`chart-item chart-${chart.difficulty.toLowerCase()}`} key={chart.difficulty}>
                          <small>{chart.difficulty}</small>
                          <strong>{chart.difficulty === "ASTRA" ? "★" : ""}{chart.level}</strong>
                        </span>
                      ))}
                    </div>
                    <button
                      className="ban-button"
                      type="button"
                      aria-pressed={isBanned}
                      onClick={() => toggleBan(song.id)}
                    >
                      <span aria-hidden="true">{isBanned ? "+" : "×"}</span>
                      {isBanned ? "BAN解除" : "BAN"}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">∅</span>
              <h3>該当する曲がありません</h3>
              <p>条件を変更するか、フィルターをクリアしてください。</p>
              <button type="button" onClick={resetFilters}>フィルターをクリア</button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>KALPA SELECTION</span>
        <span>Pick. Play. Repeat.</span>
      </footer>
    </div>
  );
}

export default App;
