# Change Log

## 0.0.2

- Hover 表示に復帰
- Alt+T 時に scheme+language で HoverProvider を再登録してスコア最大化

## 0.1.0

- Initial MVP release
- Translate selected text via Google Translate web endpoint
- When nothing is selected, select the cursor line in reverse (end → start) then translate
- Show result in standard VS Code / Cursor hover (`Alt+T`)
- Auto language detection with reverse translation support
