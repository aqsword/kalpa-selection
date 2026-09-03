import type { Song } from "../domain/song";

// このファイルは npm run data:convert で生成されます。直接編集しないでください。
export const songs = [
  {
    id: "1",
    title: "∀",
    composer: "ああああ",
    pack: "sut",
    levels: {
      NORMAL: 4,
      HARD: 13,
      COSMOS: 17,
    },
  },
  {
    id: "2",
    title: "¢orrupted ar¢hetype",
    composer: "Lauridsen & VOiD",
    pack: "sut",
    levels: {
      NORMAL: 8,
      HARD: 14,
      COSMOS: 18,
    },
  },
  {
    id: "3",
    title: "3.566×10^80m3",
    composer: "Apo11o program vs. Ice ft.朧-oboro-",
    pack: "sut",
    levels: {
      NORMAL: 6,
      HARD: 13,
      COSMOS: 18,
    },
  },
  {
    id: "4",
    title: "420mb (Game Edit)",
    composer: "ariiol",
    pack: "sut",
    levels: {
      NORMAL: 6,
      HARD: 14,
      COSMOS: 18,
    },
  },
  {
    id: "5",
    title: "Aci-L (Remaster)",
    composer: "-45",
    pack: "sut",
    levels: {
      NORMAL: 6,
      HARD: 15,
      COSMOS: 17,
    },
  },
  {
    id: "6",
    title: "Aci-L (since04' orangentle Remix)",
    composer: "orangentle",
    pack: "sut",
    levels: {
      NORMAL: 8,
      HARD: 15,
      COSMOS: 18,
    },
  },
  {
    id: "7",
    title: "Alice in Misanthrope -厭世アリス-",
    composer: "LeaF",
    pack: "sut",
    levels: {
      NORMAL: 7,
      HARD: 13,
      COSMOS: 17,
    },
  },
  {
    id: "8",
    title: "Altale",
    composer: "削除(Sakuzyo)",
    pack: "sut",
    levels: {
      NORMAL: 6,
      HARD: 12,
      COSMOS: 17,
    },
  },
  {
    id: "9",
    title: "Amphetamine",
    composer: "MonstDeath vs Neutral Moon",
    pack: "sut",
    levels: {
      NORMAL: 8,
      HARD: 13,
      COSMOS: 17,
    },
  },
] as const satisfies readonly Song[];
