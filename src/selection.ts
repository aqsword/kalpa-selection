import type { Song } from "./domain/song";

export const DIFFICULTIES = ["NORMAL", "HARD", "COSMOS", "ASTRA"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type SongFilters = Readonly<{
  query: string;
  composer: string;
  pack: string;
  difficulties: readonly Difficulty[];
  levels: readonly number[];
}>;

export type Chart = Readonly<{
  difficulty: Difficulty;
  level: number;
}>;

export type Candidate = Readonly<{
  song: Song;
  charts: readonly Chart[];
}>;

export type RandomSelection = Readonly<{
  song: Song;
  chart: Chart;
}>;

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase();
}

export function getSongCharts(song: Song): Chart[] {
  return DIFFICULTIES.flatMap((difficulty) => {
    const level = song.levels[difficulty];
    return level === undefined ? [] : [{ difficulty, level }];
  });
}

export function getMatchingCharts(song: Song, filters: SongFilters): Chart[] {
  const selectedDifficulties = new Set(filters.difficulties);
  const selectedLevels = new Set(filters.levels);

  return getSongCharts(song).filter(
    ({ difficulty, level }) =>
      (selectedDifficulties.size === 0 || selectedDifficulties.has(difficulty)) &&
      (selectedLevels.size === 0 || selectedLevels.has(level)),
  );
}

export function getCandidates(
  songs: readonly Song[],
  filters: SongFilters,
  bannedIds: ReadonlySet<string> = new Set(),
): Candidate[] {
  const query = normalize(filters.query.trim());

  return songs.flatMap((song) => {
    if (query && !normalize(song.title).includes(query)) {
      return [];
    }
    if (filters.composer && song.composer !== filters.composer) {
      return [];
    }
    if (filters.pack && song.pack !== filters.pack) {
      return [];
    }
    if (bannedIds.has(song.id)) {
      return [];
    }

    const charts = getMatchingCharts(song, filters);
    return charts.length > 0 ? [{ song, charts }] : [];
  });
}

export function pickRandomCandidate(
  candidates: readonly Candidate[],
  random: () => number = Math.random,
): RandomSelection | null {
  return pickRandomCandidates(candidates, 1, random)[0] ?? null;
}

export function pickRandomCandidates(
  candidates: readonly Candidate[],
  count: number,
  random: () => number = Math.random,
): RandomSelection[] {
  const pool = [...candidates];
  const selectionCount = Math.min(Math.max(0, Math.floor(count)), pool.length);
  const selections: RandomSelection[] = [];

  for (let index = 0; index < selectionCount; index += 1) {
    const candidateIndex = Math.min(
      Math.floor(random() * pool.length),
      pool.length - 1,
    );
    const [candidate] = pool.splice(candidateIndex, 1);
    const chartIndex = Math.min(
      Math.floor(random() * candidate.charts.length),
      candidate.charts.length - 1,
    );

    selections.push({
      song: candidate.song,
      chart: candidate.charts[chartIndex],
    });
  }

  return selections;
}
