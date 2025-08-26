import json

def convert_nissan_to_jsonl_final():
    """nissan.jsonlを配列形式からJSON Lines形式に変換"""
    
    # 既存のnissan.jsonlを読み込み（配列形式）
    with open("export/nissan.jsonl", 'r', encoding='utf-8') as f:
        models_array = json.load(f)
    
    # JSON Lines形式で書き込み（1行1オブジェクト）
    with open("export/nissan.jsonl", 'w', encoding='utf-8') as f:
        for model in models_array:
            f.write(json.dumps(model, ensure_ascii=False) + '\n')
    
    print(f"変換完了: {len(models_array)}件の車種をJSON Lines形式に変換しました")

if __name__ == "__main__":
    convert_nissan_to_jsonl_final()
