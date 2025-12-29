# git-turbo Agents

## Rules

- console は使用せず、 [consola](https://uithub.com/unjs/consola?accept=text/html&maxTokens=10000000) を使用すること。

## 実装案

あくまで案です。実装する必要はありません。

| コマンド | コンセプト | 何をするか（要点） | 依存/前提 | 実装難易度 |
| --- | --- | --- | --- | --- |
| `gt tp` | teleport | 未コミットがあれば名前付き stash → 指定ブランチへ移動 → `--back` で元ブランチへ戻って stash を復元。作業中断/復帰を最短化。 | git | 中 |
| `gt fw` | flow | 現状（未コミット/未push/コンフリクト/リベース中など）を判定して「次にやるべき操作」を提案。`--apply` で実行も可能。 | git | 中 |
| `gt rs` | rescue | rebase/merge/cherry-pick 中断状態を検知し、`abort/continue/skip` を安全に案内（必要なら実行）。reflog/ORIG_HEAD を使って復旧ポイント提示。 | git | 中〜高 |
| `gt co` | context | PR/Issue に貼れる作業コンテキスト（差分統計、影響ファイル上位、ベースとの差分など）を Markdown で生成。 | git | 低〜中 |
| `gt rr` | re-review | リリース/PR前の自己点検（README更新？テスト更新？破壊的変更臭？など）をチェックリスト化。`gh` があれば PR 情報も加味。 | git（任意で gh） | 中 |
| `gt sp` | spark | ブランチ作成のテンプレ強化（`spike/` `release/` など）＋ブランチ説明を保存（例: `git config branch.<name>.description`）。 | git | 低〜中 |
| `gt wd` | widen | “安全側” 同期。stash→更新→rebase→復元までをトランザクション的に実行し、失敗時に元状態へ戻すことを重視。 | git | 中 |
| `gt gh` | ghost | WIP/ドラフト PR 作成の定型化（ブランチ作成→push→`gh pr create --draft`）。`gh` がなければローカルだけにフォールバック。 | git（任意で gh） | 中 |
| `gt t` | trace | 「この変更どこから？」を短く追跡（直近コミット/変更ファイルの log/blame 要約）。大出力は抑制して要点のみ。 | git | 中 |

