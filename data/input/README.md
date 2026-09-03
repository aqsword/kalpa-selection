# KALPA曲データ入力フォルダ

このフォルダに、次の名前でExcelファイルを保存してください。

```text
kalpa-songs.xlsx
```

1行目には、次の列名を順番どおりに入力します。

| A | B | C | D | E | F | G |
| --- | --- | --- | --- | --- | --- | --- |
| id | 曲名 | 作曲者 | NORMAL | HARD | COSMOS | ASTRA |

2行目以降へ曲を入力してください。空行は変換時に無視されます。

## 入力ルール

- `id`: 必須。一意な小文字英数字とハイフン（例: `sample-song`）
- `曲名`: 必須
- `作曲者`: 必須
- `NORMAL`: 必須。整数1〜20
- `HARD`: 必須。整数1〜20
- `COSMOS`: 必須。整数1〜20
- `ASTRA`: 任意。存在する場合だけ整数1〜4

Excelの「データの入力規則」を使う場合は、`NORMAL`、`HARD`、`COSMOS`を整数1〜20、`ASTRA`を整数1〜4に設定してください。

## TypeScriptへの変換

リポジトリ直下で次を実行します。

```bash
npm run data:convert
```

入力内容が正しければ、`src/data/songs.ts`が更新されます。入力エラーがある場合は行番号と理由が表示され、既存の`src/data/songs.ts`は変更されません。

