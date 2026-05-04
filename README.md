# Paper Assistant

## アプリ概要
Paper Assistantは、医師や医学研究者が論文を作成する際に、生成AI（ChatGPT, Claude, Gemini）を効果的に活用するためのプロンプト生成支援ローカルWebアプリです。
入力された論文の背景情報や草稿をもとに、各AIの特徴（論理構成のChatGPT、自然な表現のClaude、文献検索のGemini）に合わせた最適なプロンプトを自動生成します。

## 使い方
1. `index.html`をブラウザで開きます。
2. 左側の**Input Form**に、論文のタイトル、研究タイプ、ターゲット誌、日本語草稿や英語草稿、キーとなる結果などを入力します。
3. 右側の**Task Selection**から実行したいタスク（例：Japanese to academic English, Discussion improvementなど）を選択します。
4. **「Generate Prompts」**ボタンをクリックします。
5. **Generated Prompts**エリアに、ChatGPT、Claude、Gemini用のプロンプトがそれぞれ生成されます。
6. 各タブの**「Copy Prompt」**ボタンを押してプロンプトをコピーし、ご自身で使用しているAIサービス（ChatGPT等のWeb画面）に貼り付けます。
7. AIからの回答結果を**AI Responses**エリアに貼り付け、各AIの出力を比較します。
8. 比較した結果をもとに、**Final Integrated Draft**（最終統合ドラフト）エリアで最終的な文章を作成します。
9. 必要に応じて**「Save to Local」**でブラウザに一時保存するか、**「Export JSON」**でデータをファイルとして保存します。

## 注意事項
- **患者の個人情報の取り扱い:** 患者氏名、ID、生年月日、住所などの個人情報は絶対に入力しないでください。AIサービスに貼り付ける前に必ず匿名化を行ってください。
- **人間の確認:** AIの出力には誤り（ハルシネーション）が含まれる可能性があります。必ず人間の目で内容を確認してください。
- **文献の事実確認:** AIが提案した文献情報（PMIDやDOIなど）は、必ずPubMedや出版社のサイトで実在するか確認してください。

## API連携について（New!）
本アプリケーションは、**OpenAI API (ChatGPT)** との連携機能を搭載しています。
1. 画面左側の「OpenAI API Configuration」に、ご自身のAPIキー (`sk-...`) を入力し「Save Key」を押します（キーはブラウザのLocalStorageに保存され、外部サーバーには送信されません）。
2. プロンプト生成後、ChatGPTタブ内にある「Run with ChatGPT」ボタンを押すと、自動的にAPIへリクエストが送信され、右下の「ChatGPT Response」欄に結果が表示されます。

**【重要セキュリティ事項】**
- **共有PCではAPIキーを保存（入力）しないでください。**
- **送信データに患者情報が含まれていないか、実行前に必ず確認してください。**
※ Anthropic(Claude), Google(Gemini)等の他APIについては未接続です。

## 将来的な拡張案
今後のバージョンアップとして以下の機能拡張を想定しています。
- Gemini API連携（アプリ内でのGemini直接応答）
- Claude API連携（アプリ内でのClaude直接応答）
- PubMed API連携（提案された文献の自動実在チェック）
- Word出力（作成したFinal Draftの.docx形式でのエクスポート）
- Zotero/BibTeX連携（文献管理ツールへのエクスポート機能）
