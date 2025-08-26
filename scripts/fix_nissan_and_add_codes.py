import json

def fix_nissan_and_add_codes():
    """nissan.jsonlをJSON Lines形式に戻してから"codes":[]を追加"""
    
    # 既存のnissan.jsonlを読み込み（配列形式）
    with open("export/nissan.jsonl", 'r', encoding='utf-8') as f:
        models_array = json.load(f)
    
    # JSON Lines形式で書き込み（"codes":[]付き）
    with open("export/nissan.jsonl", 'w', encoding='utf-8') as f:
        for model in models_array:
            if "codes" not in model:
                model["codes"] = []
            f.write(json.dumps(model, ensure_ascii=False) + '\n')
    
    print(f"変換完了: {len(models_array)}件の車種をJSON Lines形式に変換し、codesを追加しました")

if __name__ == "__main__":
    fix_nissan_and_add_codes()
