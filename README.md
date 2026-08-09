# Translator

Cursor / VS Code 向けのシンプルな翻訳拡張機能です。エディターで文字列を選択し、ショートカットを押すと Google 翻訳の結果を標準 Hover に一時表示します。

## 使い方

1. 翻訳したい文字列を選択する（未選択ならカーソル行を行末→行頭の向きで選択してから翻訳）
2. `Alt+T` を押す（コマンド: **Translator: Translate Selection**）
3. 選択範囲付近の Hover に翻訳結果が表示される

表示例:

```text
[Translation: en -> ja]
こんにちは、世界
```

Alt+T 時は、現在ドキュメントの scheme+language 向けに HoverProvider を再登録してスコアを最大化し、翻訳結果を Hover に表示します。他拡張の Hover と結合される場合があり、順番は環境によって末尾寄りになることもあります。

翻訳結果は表示のみです。原文の置換、挿入、クリップボードへの自動コピー、履歴保存は行いません。

## 設定

| 設定 | デフォルト | 説明 |
| --- | --- | --- |
| `translator.sourceLanguage` | `auto` | 翻訳元言語。`auto` または空文字で自動判定 |
| `translator.targetLanguage` | `ja` | 翻訳先言語 |
| `translator.reverseLanguage` | `en` | 検出言語が `targetLanguage` と同じときの翻訳先 |

`sourceLanguage` が `auto` のとき、日本語を選ぶと英語へ、英語を選ぶと日本語へ、といった双方向の翻訳になります。

## プライバシー

この拡張はローカル翻訳ではありません。選択した文字列は HTTPS 経由で Google 翻訳サービスへ送信されます。機密コード、認証情報、顧客情報などの翻訳には注意してください

## 技術的な注意

Google 翻訳サービス側の仕様変更・レート制限・一時的な拒否などがあり得ます。翻訳通信は `GoogleTranslateClient` に隔離しています。

## 開発

```bash
pnpm install
pnpm run build
pnpm test
```

Extension Development Host で試す場合は、VS Code / Cursor から **Run Extension** 起動構成を使ってください。
