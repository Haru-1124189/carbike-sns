import json

def fix_nissan_format():
    """nissan.jsonlの形式を修正してJSON Lines形式に変換"""
    
    # ファイルを読み込み
    with open("export/nissan.jsonl", 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 配列の開始と終了を削除
    content = content.strip()
    if content.startswith('['):
        content = content[1:]
    if content.endswith(']'):
        content = content[:-1]
    
    # 各行を処理
    lines = content.split('\n')
    updated_lines = []
    
    for line in lines:
        line = line.strip()
        if line and not line.startswith('[') and not line.endswith(']'):
            # 末尾のカンマを削除
            if line.endswith(','):
                line = line[:-1]
            
            # JSONオブジェクトとして解析
            try:
                model = json.loads(line)
                updated_lines.append(json.dumps(model, ensure_ascii=False))
            except json.JSONDecodeError as e:
                print(f"JSON解析エラー: {line} - {e}")
    
    # JSON Lines形式で書き込み
    with open("export/nissan.jsonl", 'w', encoding='utf-8') as f:
        for line in updated_lines:
            f.write(line + '\n')
    
    print(f"変換完了: {len(updated_lines)}件の車種をJSON Lines形式に変換しました")

if __name__ == "__main__":
    fix_nissan_format()
