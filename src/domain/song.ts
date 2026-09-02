/** 通常譜面の難易度。すべての曲が3種類を持つ。 */
export const STANDARD_DIFFICULTIES = ["NORMAL", "HARD", "COSMOS"] as const;

export type StandardDifficulty = (typeof STANDARD_DIFFICULTIES)[number];

/** NORMAL / HARD / COSMOSの曲レベル。 */
export type SongLevel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

/** ASTRA譜面の星数。 */
export type AstraStar = 1 | 2 | 3 | 4;

/**
 * 曲ごとの譜面レベル。
 * 通常3難易度は必須、ASTRAは存在する曲だけ指定する。
 */
export type SongLevels = Readonly<
  Record<StandardDifficulty, SongLevel> & {
    ASTRA?: AstraStar;
  }
>;

export type Song = Readonly<{
  /** BANや選択状態で利用する、変更しない一意なID。 */
  id: string;
  title: string;
  composer: string;
  levels: SongLevels;
}>;

