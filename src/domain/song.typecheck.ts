import type { Song } from "./song";

const validSong = {
  id: "sample-song",
  title: "Sample Song",
  composer: "Sample Composer",
  pack: "Sample Pack",
  levels: {
    NORMAL: 1,
    HARD: 10,
    COSMOS: 20,
    ASTRA: 4,
  },
} as const satisfies Song;

const validSongWithoutAstra = {
  id: "sample-song-without-astra",
  title: "Sample Song Without ASTRA",
  composer: "Sample Composer",
  pack: "Sample Pack",
  levels: {
    NORMAL: 1,
    HARD: 10,
    COSMOS: 20,
  },
} as const satisfies Song;

const invalidStandardLevel = {
  id: "invalid-standard-level",
  title: "Invalid Standard Level",
  composer: "Sample Composer",
  pack: "Sample Pack",
  levels: {
    // @ts-expect-error 通常譜面のレベル21は許可しない
    NORMAL: 21,
    HARD: 10,
    COSMOS: 20,
  },
} as const satisfies Song;

const invalidAstraStar = {
  id: "invalid-astra-star",
  title: "Invalid ASTRA Star",
  composer: "Sample Composer",
  pack: "Sample Pack",
  levels: {
    NORMAL: 1,
    HARD: 10,
    COSMOS: 20,
    // @ts-expect-error ASTRAの星5は許可しない
    ASTRA: 5,
  },
} as const satisfies Song;

void validSong;
void validSongWithoutAstra;
void invalidStandardLevel;
void invalidAstraStar;
