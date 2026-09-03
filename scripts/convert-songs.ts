import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readXlsxFile from "read-excel-file/node";

const EXPECTED_HEADERS = [
  "id",
  "曲名",
  "作曲者",
  "NORMAL",
  "HARD",
  "COSMOS",
  "ASTRA",
] as const;

type ConvertedSong = {
  id: string;
  title: string;
  composer: string;
  normal: number;
  hard: number;
  cosmos: number;
  astra?: number;
};

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === "";
}

function readRequiredText(
  value: unknown,
  label: string,
  rowNumber: number,
  errors: string[],
): string {
  const text = isBlank(value) ? "" : String(value).trim();

  if (!text) {
    errors.push(`${rowNumber}行目: ${label}は必須です。`);
  }

  return text;
}

function readInteger(
  value: unknown,
  label: string,
  rowNumber: number,
  min: number,
  max: number,
  errors: string[],
  optional = false,
): number | undefined {
  if (isBlank(value)) {
    if (!optional) {
      errors.push(`${rowNumber}行目: ${label}は必須です。`);
    }
    return undefined;
  }

  const number = typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isInteger(number) || number < min || number > max) {
    errors.push(`${rowNumber}行目: ${label}は${min}〜${max}の整数で入力してください。`);
    return undefined;
  }

  return number;
}

function toTypeScript(songs: readonly ConvertedSong[]): string {
  const entries = songs.map((song) => {
    const astraLine = song.astra === undefined ? "" : `\n      ASTRA: ${song.astra},`;

    return `  {
    id: ${JSON.stringify(song.id)},
    title: ${JSON.stringify(song.title)},
    composer: ${JSON.stringify(song.composer)},
    levels: {
      NORMAL: ${song.normal},
      HARD: ${song.hard},
      COSMOS: ${song.cosmos},${astraLine}
    },
  },`;
  });

  return `import type { Song } from "../domain/song";

// このファイルは npm run data:convert で生成されます。直接編集しないでください。
export const songs = [
${entries.join("\n")}
] as const satisfies readonly Song[];
`;
}

async function main(): Promise<void> {
  const inputPath = path.resolve(process.argv[2] ?? "data/input/kalpa-songs.xlsx");
  const outputPath = path.resolve(process.argv[3] ?? "src/data/songs.ts");

  try {
    await access(inputPath);
  } catch {
    throw new Error(
      `Excelファイルが見つかりません: ${inputPath}\n` +
        "data/input/kalpa-songs.xlsx を作成してから再実行してください。",
    );
  }

  const rows = await readXlsxFile(inputPath);

  if (rows.length === 0) {
    throw new Error("Excelファイルにヘッダー行がありません。");
  }

  const actualHeaders = rows[0].map((value) => String(value ?? "").trim());
  const headersMatch =
    actualHeaders.length === EXPECTED_HEADERS.length &&
    EXPECTED_HEADERS.every((header, index) => actualHeaders[index] === header);

  if (!headersMatch) {
    throw new Error(
      `1行目の列名が正しくありません。次の順番にしてください:\n${EXPECTED_HEADERS.join(", ")}`,
    );
  }

  const errors: string[] = [];
  const songs: ConvertedSong[] = [];
  const usedIds = new Set<string>();

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;

    if (row.every(isBlank)) {
      return;
    }

    const id = readRequiredText(row[0], "id", rowNumber, errors);
    const title = readRequiredText(row[1], "曲名", rowNumber, errors);
    const composer = readRequiredText(row[2], "作曲者", rowNumber, errors);
    const normal = readInteger(row[3], "NORMAL", rowNumber, 1, 20, errors);
    const hard = readInteger(row[4], "HARD", rowNumber, 1, 20, errors);
    const cosmos = readInteger(row[5], "COSMOS", rowNumber, 1, 20, errors);
    const astra = readInteger(row[6], "ASTRA", rowNumber, 1, 4, errors, true);

    if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      errors.push(
        `${rowNumber}行目: idは小文字英数字と単語間のハイフンだけで入力してください。`,
      );
    }

    if (id && usedIds.has(id)) {
      errors.push(`${rowNumber}行目: id「${id}」が重複しています。`);
    }
    usedIds.add(id);

    if (id && title && composer && normal && hard && cosmos) {
      songs.push({ id, title, composer, normal, hard, cosmos, astra });
    }
  });

  if (errors.length > 0) {
    throw new Error(`入力内容にエラーがあります:\n- ${errors.join("\n- ")}`);
  }

  if (songs.length === 0) {
    throw new Error("変換できる曲がありません。2行目以降へ曲を入力してください。");
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, toTypeScript(songs), "utf8");

  console.log(`${songs.length}曲を変換しました: ${outputPath}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

