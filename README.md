# KALPA Selection

KALPAの曲一覧を検索し、候補からランダムに一曲を選ぶための小さなWebアプリです。

曲名・作曲者・パック・難易度・レベルでの絞り込み、ランダム選出、曲のBAN（除外）ができます。
BANした曲はブラウザ内に保存され、次回アクセス時にも選出候補から除外されます。

## 曲データ

曲は、一意なID、曲名、作曲者、追加されたパック、譜面ごとのレベルを持ちます。
`NORMAL`、`HARD`、`COSMOS`は必須でレベル1〜20、`ASTRA`は存在する曲だけ星1〜4を指定します。

```ts
{
  id: "sample-song",
  title: "Sample Song",
  composer: "Sample Composer",
  pack: "Sample Pack",
  levels: {
    NORMAL: 3,
    HARD: 8,
    COSMOS: 14,
    ASTRA: 2,
  },
}
```

実際の曲データは`src/data/songs.ts`へ追加します。

Excelから作成する場合は、`data/input/kalpa-songs.xlsx`へ曲一覧を入力して次を実行します。

```bash
npm run data:convert
```

Excelの列と入力ルールは`data/input/README.md`を参照してください。

## ローカル起動

```bash
npm install
npm run dev
```

## 本番ビルド

```bash
npm run build
npm run preview
```

## テスト

```bash
npm test
```

検索条件、BANによる除外、ランダム選出のロジックを確認します。

`main`ブランチへpushすると、GitHub ActionsからGitHub Pagesへ公開されます。
