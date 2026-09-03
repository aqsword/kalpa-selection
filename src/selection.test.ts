import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Song } from "./domain/song";
import {
  getCandidates,
  getMatchingCharts,
  pickRandomCandidate,
  type SongFilters,
} from "./selection";

const sampleSongs = [
  {
    id: "alpha",
    title: "Alpha Song",
    composer: "Composer A",
    pack: "Pack 1",
    levels: { NORMAL: 4, HARD: 10, COSMOS: 17, ASTRA: 2 },
  },
  {
    id: "beta",
    title: "Beta Song",
    composer: "Composer B",
    pack: "Pack 2",
    levels: { NORMAL: 6, HARD: 13, COSMOS: 18 },
  },
] as const satisfies readonly Song[];

const emptyFilters: SongFilters = {
  query: "",
  composer: "",
  pack: "",
  difficulties: [],
  levels: [],
};

describe("getCandidates", () => {
  it("曲名を大文字小文字を区別せず部分一致で検索する", () => {
    const result = getCandidates(sampleSongs, { ...emptyFilters, query: "PHA s" });
    assert.deepEqual(result.map(({ song }) => song.id), ["alpha"]);
  });

  it("作曲者とパックを完全一致で絞り込む", () => {
    const result = getCandidates(sampleSongs, {
      ...emptyFilters,
      composer: "Composer B",
      pack: "Pack 2",
    });
    assert.deepEqual(result.map(({ song }) => song.id), ["beta"]);
  });

  it("難易度とレベルが同じ譜面で一致した曲だけを返す", () => {
    const result = getCandidates(sampleSongs, {
      ...emptyFilters,
      difficulties: ["HARD"],
      levels: [13],
    });
    assert.deepEqual(result.map(({ song }) => song.id), ["beta"]);
    assert.deepEqual(result[0].charts, [{ difficulty: "HARD", level: 13 }]);
  });

  it("ASTRAがない曲をASTRA検索に含めない", () => {
    const result = getCandidates(sampleSongs, {
      ...emptyFilters,
      difficulties: ["ASTRA"],
    });
    assert.deepEqual(result.map(({ song }) => song.id), ["alpha"]);
  });

  it("BANした曲を候補から除外する", () => {
    const result = getCandidates(sampleSongs, emptyFilters, new Set(["alpha"]));
    assert.deepEqual(result.map(({ song }) => song.id), ["beta"]);
  });
});

describe("getMatchingCharts", () => {
  it("複数レベルに一致する譜面をすべて返す", () => {
    const charts = getMatchingCharts(sampleSongs[0], {
      ...emptyFilters,
      levels: [4, 17],
    });
    assert.deepEqual(charts, [
      { difficulty: "NORMAL", level: 4 },
      { difficulty: "COSMOS", level: 17 },
    ]);
  });
});

describe("pickRandomCandidate", () => {
  it("曲を選んでから、その曲の一致譜面を選ぶ", () => {
    const candidates = getCandidates(sampleSongs, emptyFilters);
    const values = [0.75, 0.4];
    const result = pickRandomCandidate(candidates, () => values.shift() ?? 0);

    assert.equal(result?.song.id, "beta");
    assert.deepEqual(result?.chart, { difficulty: "HARD", level: 13 });
  });

  it("候補がなければnullを返す", () => {
    assert.equal(pickRandomCandidate([]), null);
  });
});
