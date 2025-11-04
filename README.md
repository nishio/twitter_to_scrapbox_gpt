# Twitter(X) to Scrapbox

X(旧Twitter)の投稿をScrapbox形式に変換してクリップボードにコピーするTampermonkeyスクリプトです。

## 概要

このツールは2023年3月21日にGPT-4を使った実験として作成されました。X/Twitterの画面で投稿を選択し、Scrapbox形式に整形してクリップボードにコピーすることができます。

## 機能

- テキストの引用記法への変換（各行の先頭に`>`を追加）
- 画像URLの抽出とScrapbox形式への変換（`[URL#.png]`形式）
- リンクカードのタイトル抽出
- 引用ツイートの再帰的な処理
- アカウント名とツイートURLのリンク化
- 複数行のツイート内容に対応

## インストール方法

### 1. Tampermonkeyのインストール

まず、ブラウザにTampermonkey拡張機能をインストールします：

- [Chrome版Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox版Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- [Edge版Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. スクリプトのインストール

1. [script.js](https://github.com/nishio/twitter_to_scrapbox_gpt/blob/main/script.js)を開く
2. Rawボタンをクリックしてスクリプトの内容を表示
3. 内容をコピー
4. Tampermonkeyのダッシュボードを開く
5. 「新規スクリプトを作成」をクリック
6. コピーした内容を貼り付けて保存

## 使い方

1. X(Twitter)のページを開く
2. 画面右上に「Export to Scrapbox」ボタンが表示される
3. 変換したいツイートを範囲選択する（選択しない場合は画面上のすべてのツイートが対象）
4. 「Export to Scrapbox」ボタンをクリック
5. Scrapbox形式に変換されたテキストがクリップボードにコピーされる
6. Scrapboxに貼り付ける

## 出力形式の例

```
>[nishio https://x.com/nishio/status/1234567890] これはサンプルのツイートです
> 複数行の場合は
> 各行の先頭に > が付きます
> [https://example.com/image.jpg#.png]
```

## 開発

### 開発用スクリプト

`dev.js`は開発者ツールのコンソールで実行しながら開発するためのファイルです。`run()`関数を実行すると、選択されたツイートの変換結果がコンソールに出力されます。

### 主な変更履歴

- **2024-05-18**: `twitter.com`から`x.com`への移行に対応
- **2023-03-21**: GPT-4による初版作成

## 既知の制限事項

- ツイートに別のツイートが引用で埋め込まれている場合、顔アイコンも添付画像とみなされることがある
- カードの説明文の改行が引用記法にならない場合がある
- X/TwitterのHTML構造に依存しているため、UIの変更により動作しなくなる可能性がある

## 参考リンク

- [開発ログ（Scrapbox）](https://scrapbox.io/villagepump/Twitter_to_Scrapbox_GPT)
- [使用方法（Scrapbox）](https://scrapbox.io/nishio/XをScrapboxに転記するツール)

## ライセンス

作者: NISHIO Hirokazu (+ GPT-4)
