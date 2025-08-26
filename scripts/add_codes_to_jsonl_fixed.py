import json
import os
import glob

def add_codes_to_jsonl_files():
    """exportディレクトリ内のJSONLファイルに"codes":[]を追加（JSON Lines形式を維持）"""
    
    # 対象外のファイル
    exclude_files = ["wd_bikes.jsonl", "wd_cars.jsonl"]
    
    # exportディレクトリ内のJSONLファイルを取得
    jsonl_files = glob.glob("export/*.jsonl")
    
    for file_path in jsonl_files:
        filename = os.path.basename(file_path)
        
        # 対象外ファイルはスキップ
        if filename in exclude_files:
            print(f"スキップ: {filename}")
            continue
        
        print(f"処理中: {filename}")
        
        try:
            # ファイルを読み込み
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            # JSON Lines形式か配列形式かを判定
            if content.startswith('['):
                # 配列形式の場合
                models = json.loads(content)
                updated_models = []
                for model in models:
                    if "codes" not in model:
                        model["codes"] = []
                    updated_models.append(model)
                
                # 配列形式で書き込み
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(updated_models, f, ensure_ascii=False, indent=4)
                
            else:
                # JSON Lines形式の場合
                lines = content.split('\n')
                updated_lines = []
                
                for line in lines:
                    if line.strip():
                        model = json.loads(line)
                        if "codes" not in model:
                            model["codes"] = []
                        updated_lines.append(json.dumps(model, ensure_ascii=False))
                
                # JSON Lines形式で書き込み
                with open(file_path, 'w', encoding='utf-8') as f:
                    for line in updated_lines:
                        f.write(line + '\n')
            
            print(f"  完了: {filename}")
            
        except Exception as e:
            print(f"  エラー: {filename} - {str(e)}")

if __name__ == "__main__":
    add_codes_to_jsonl_files()
