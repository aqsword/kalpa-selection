import type { AstraStar } from "../src/domain/song";

/** Excelの単独の数値、またはカンマ区切りのASTRA星数を読み取る。 */
export function parseAstraStars(value: unknown): AstraStar[] | undefined {
  if (value === null || value === undefined || String(value).trim() === "") {
    return undefined;
  }

  const parts = String(value).normalize("NFKC").split(",").map((part) => part.trim());
  if (parts.some((part) => !/^[1-4]$/.test(part))) {
    throw new Error(
      "ASTRAは1〜4の整数で入力してください。複数譜面は「1,3」のようにカンマで区切ってください。",
    );
  }

  return parts.map((part) => Number(part) as AstraStar);
}
