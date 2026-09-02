import type { Song } from "../domain/song";

/**
 * KALPAの曲データ。
 * 実データは次の工程で、この配列へ追加する。
 */
export const songs = [] as const satisfies readonly Song[];

