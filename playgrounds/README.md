# playgrounds

このディレクトリは、gt コマンドを **メインのリポジトリに影響させず** に試すための置き場です。

## 何がある？

- gt-sandbox.sh
  - ネストしたサンドボックス Git リポジトリを作り、その中で gt を実行します。
- gt.config.ts
  - サンドボックスで読み込ませたい gt の設定を置きます（後述）。

## 使い方

基本は pnpm スクリプト経由で実行します。

```sh
pnpm gt:sandbox -- --help
pnpm gt:sandbox -- nb main feature/test -y
```

### オプション

サンドボックス側のオプションは、gt の引数の前に置きます。

```sh
pnpm gt:sandbox -- --fresh nb main demo -p f -y
pnpm gt:sandbox -- --no-config nb main demo -y
pnpm gt:sandbox -- --config playgrounds/gt.config.ts nb main demo -y
```

- --fresh
  - 実行前にサンドボックス repo を作り直します（毎回クリーンな状態）。
- --no-config
  - 設定ファイルのコピーをスキップします。
- --config <path>
  - 指定したファイルをサンドボックス repo 直下へ `gt.config.*` としてコピーします。
  - 相対パスはリポジトリルート基準です。

## gt.config.ts はどこに置く？

デフォルトでは playgrounds 配下の設定を使います。

- playgrounds/gt.config.ts（推奨）

gt-sandbox.sh は、playgrounds/gt.config.*（ts/js/json など）を見つけたら、
サンドボックス Git リポジトリのルートにコピーしてから gt を実行します。

## サンドボックスの場所

- playgrounds/.gt-sandbox/repo

ここは .gitignore 済みです。

## 補足: pnpm の `--`

`pnpm <script> -- <args...>` は pnpm の引数区切りです。

- 例: `pnpm gt:sandbox -- nb main x -y`

一方、サンドボックス側オプション（--fresh など）も渡したい場合は、
`pnpm` の区切り `--` の後ろに置いてください。

- 例: `pnpm gt:sandbox -- --fresh nb main x -y`
