import { useEffect, useMemo, useRef, useState } from "react";
import { songs } from "./data/songs";
import {
  DIFFICULTIES,
  getCandidates,
  getSongCharts,
  pickRandomCandidates,
  type Difficulty,
  type RandomSelection,
} from "./selection";

const LEVELS = Array.from({ length: 20 }, (_, index) => index + 1);
const SELECTION_COUNTS = [1, 2, 3] as const;
const BAN_STORAGE_KEY = "kalpa-selection:banned-song-ids:v1";
const ANIMATION_STORAGE_KEY = "kalpa-selection:animation-enabled:v1";

type SelectionCount = (typeof SELECTION_COUNTS)[number];
type AnimationPhase = "idle" | "shuffle" | "reveal";

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

function getInitialAnimationEnabled(): boolean {
  try {
    return window.localStorage.getItem(ANIMATION_STORAGE_KEY) !== "false";
  } catch {
    return true;
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
  const [selectionCount, setSelectionCount] = useState<SelectionCount>(1);
  const [selections, setSelections] = useState<RandomSelection[]>([]);
  const [previewSelections, setPreviewSelections] = useState<RandomSelection[]>([]);
  const [animationEnabled, setAnimationEnabled] = useState(getInitialAnimationEnabled);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
  const [isBanListOpen, setIsBanListOpen] = useState(false);
  const animationTimers = useRef<number[]>([]);
  const animationRun = useRef(0);

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
  const visibleSongs = useMemo(
    () => getCandidates(songs, filters, bannedSet),
    [filters, bannedSet],
  );
  const candidates = visibleSongs;
  const bannedSongs = useMemo(
    () => songs.filter((song) => bannedSet.has(song.id)),
    [bannedSet],
  );
  const hasFilters = Boolean(
    query || composer || pack || difficulties.length || levels.length,
  );
  const isDrawing = animationPhase !== "idle";
  const displayedSelections = isDrawing ? previewSelections : selections;

  function clearAnimationTimers(): void {
    animationTimers.current.forEach((timer) => window.clearTimeout(timer));
    animationTimers.current = [];
  }

  function cancelAnimation(): void {
    animationRun.current += 1;
    clearAnimationTimers();
    setAnimationPhase("idle");
    setPreviewSelections([]);
  }

  useEffect(() => () => {
    animationRun.current += 1;
    clearAnimationTimers();
  }, []);

  function updateFilter(update: () => void): void {
    cancelAnimation();
    update();
    setSelections([]);
  }

  function resetFilters(): void {
    cancelAnimation();
    setQuery("");
    setComposer("");
    setPack("");
    setDifficulties([]);
    setLevels([]);
    setSelections([]);
  }

  function toggleBan(songId: string): void {
    cancelAnimation();
    const isAddingToBanList = !bannedSet.has(songId);
    const nextIds = toggleValue(bannedIds, songId);
    setBannedIds(nextIds);
    window.localStorage.setItem(BAN_STORAGE_KEY, JSON.stringify(nextIds));
    if (isAddingToBanList) {
      setIsBanListOpen(true);
    }
    if (selections.some(({ song }) => song.id === songId)) {
      setSelections([]);
    }
  }

  function toggleAnimation(): void {
    const nextEnabled = !animationEnabled;
    setAnimationEnabled(nextEnabled);
    window.localStorage.setItem(ANIMATION_STORAGE_KEY, String(nextEnabled));
  }

  function drawSong(): void {
    clearAnimationTimers();
    const run = animationRun.current + 1;
    animationRun.current = run;
    const finalSelections = pickRandomCandidates(candidates, selectionCount);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!animationEnabled || reduceMotion) {
      setSelections(finalSelections);
      setPreviewSelections([]);
      setAnimationPhase("idle");
      return;
    }

    const schedule = (callback: () => void, delay: number): void => {
      const timer = window.setTimeout(() => {
        if (animationRun.current === run) {
          callback();
        }
      }, delay);
      animationTimers.current.push(timer);
    };

    setSelections([]);
    setPreviewSelections(pickRandomCandidates(candidates, selectionCount));
    setAnimationPhase("shuffle");

    for (let step = 1; step <= 7; step += 1) {
      schedule(
        () => setPreviewSelections(pickRandomCandidates(candidates, selectionCount)),
        step * 85,
      );
    }

    const revealStart = 680;
    schedule(() => {
      setPreviewSelections(finalSelections);
      setAnimationPhase("reveal");
    }, revealStart);

    schedule(() => {
      setSelections(finalSelections);
      setPreviewSelections([]);
      setAnimationPhase("idle");
      animationTimers.current = [];
    }, revealStart + finalSelections.length * 140 + 340);
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

            <div className="draw-settings">
              <label className="animation-toggle">
                <span>演出</span>
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  disabled={isDrawing}
                  onChange={toggleAnimation}
                />
                <span className="toggle-track" aria-hidden="true"><span /></span>
                <strong>{animationEnabled ? "ON" : "OFF"}</strong>
              </label>
              <div className="selection-count-control">
                <span>選出曲数</span>
                <div role="group" aria-label="選出曲数">
                  {SELECTION_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      disabled={isDrawing}
                      aria-pressed={selectionCount === count}
                      onClick={() => {
                        setSelectionCount(count);
                        setSelections([]);
                      }}
                    >
                      {count}曲
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`selection-display${displayedSelections.length > 0 ? ` has-selection result-count-${displayedSelections.length}` : ""}${animationPhase === "shuffle" ? " is-shuffling" : ""}${animationPhase === "reveal" ? " is-revealing" : ""}`}
              aria-live={animationPhase === "shuffle" ? "off" : "polite"}
              aria-busy={isDrawing}
            >
              {displayedSelections.length > 0 ? (
                <div className="selection-results">
                  {displayedSelections.map((selection, index) => (
                    <article
                      className={`selection-result result-index-${index + 1}`}
                      key={selection.song.id}
                    >
                      <p className="selection-kicker">
                        {animationPhase === "shuffle"
                          ? "SHUFFLING"
                          : displayedSelections.length === 1
                            ? "YOUR NEXT TRACK"
                            : `TRACK ${index + 1}`}
                      </p>
                      <h3>{selection.song.title}</h3>
                      <p className="selection-composer">{selection.song.composer}</p>
                      <div className="selection-meta">
                        <span className={`chart-badge badge-${selection.chart.difficulty.toLowerCase()}`}>
                          {selection.chart.difficulty}
                        </span>
                        <strong>{selection.chart.difficulty === "ASTRA" ? "★" : "Lv."}{selection.chart.level}</strong>
                        <span>{selection.song.pack}</span>
                      </div>
                    </article>
                  ))}
                  {!isDrawing && displayedSelections.length < selectionCount && (
                    <p className="selection-shortage">候補が{displayedSelections.length}曲のため、全候補を選出しました。</p>
                  )}
                </div>
              ) : (
                <>
                  <span className="roulette-mark" aria-hidden="true">✦</span>
                  <p>{candidates.length > 0 ? `${selectionCount}曲を重複なしで選出します。` : "条件に合う選出候補がありません。"}</p>
                </>
              )}
            </div>

            <button
              className="draw-button"
              type="button"
              onClick={drawSong}
              disabled={candidates.length === 0 || isDrawing}
            >
              <span>
                {animationPhase === "shuffle"
                  ? "選出中…"
                  : animationPhase === "reveal"
                    ? "結果を確定中…"
                    : selections.length > 0
                      ? "もう一度選ぶ"
                      : `${selectionCount}曲をランダムに選ぶ`}
              </span>
              <span aria-hidden="true">→</span>
            </button>
            <p className="draw-note">BANした曲は選出候補から除外されます。</p>
          </section>
        </section>

        <section
          className={`ban-library${isBanListOpen ? " is-open" : ""}`}
          aria-labelledby="ban-library-title"
        >
          <button
            className="ban-library-heading"
            type="button"
            aria-expanded={isBanListOpen}
            aria-controls="ban-library-content"
            onClick={() => setIsBanListOpen((isOpen) => !isOpen)}
          >
            <span className="ban-heading-copy">
              <span className="section-number">03</span>
              <span>
                <span className="ban-heading-title" id="ban-library-title">BANリスト</span>
                <span className="ban-heading-note">ランダム選出と曲一覧から除外中</span>
              </span>
            </span>
            <span className="ban-heading-status">
              <span><strong>{bannedSongs.length}</strong> 曲</span>
              <span className="ban-chevron" aria-hidden="true">⌄</span>
            </span>
          </button>

          {isBanListOpen && (
            <div className="ban-library-content" id="ban-library-content">
              {bannedSongs.length > 0 ? (
                <div className="banned-song-list">
                  {bannedSongs.map((song) => (
                    <article className="banned-song-card" key={song.id}>
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
                        className="unban-button"
                        type="button"
                        onClick={() => toggleBan(song.id)}
                      >
                        <span aria-hidden="true">+</span>
                        BAN解除
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="ban-empty">BANしている曲はありません。</p>
              )}
            </div>
          )}
        </section>

        <section className="library" aria-labelledby="library-title">
          <div className="library-heading">
            <div>
              <span className="section-number">04</span>
              <h2 id="library-title">曲一覧</h2>
            </div>
            <p><strong>{visibleSongs.length}</strong> / {songs.length} 曲</p>
          </div>

          {visibleSongs.length > 0 ? (
            <div className="song-list">
              {visibleSongs.map(({ song }) => (
                <article className="song-card" key={song.id}>
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
                    onClick={() => toggleBan(song.id)}
                  >
                    <span aria-hidden="true">×</span>
                    BAN
                  </button>
                </article>
              ))}
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
