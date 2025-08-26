# unify_catalog.py
# vPIC / Wikipedia(ja/en) / Wikidata(車・バイク) を名寄せして統合JSONLを吐く。
# - kind(car/bike)は使わず、統合のみ実施（kindは残すが未使用）
# - メーカー→モデルの2段クラスタ
# - RapidFuzz があれば高精度、無ければ簡易一致で代替
#
# 使い方:
#   pip install rapidfuzz
#   python unify_catalog.py \
#     --vpic ./export/vpic_raw.jsonl \
#     --wiki-ja ./export/wiki_ja_cars.jsonl ./export/wiki_ja_bikes.jsonl \
#     --wiki-en ./export/wiki_en_cars.jsonl ./export/wiki_en_bikes.jsonl \
#     --wd-cars ./export/wd_cars.jsonl \
#     --wd-bikes ./export/wd_bikes.jsonl \
#     --out ./export/unified_models.jsonl \
#     --makers ./export/makers_map.json
#
import argparse, json, os, re, sys, unicodedata
from collections import defaultdict, Counter

# RapidFuzz（任意）
try:
    from rapidfuzz import fuzz
    HAVE_RF = True
except Exception:
    HAVE_RF = False

# ---------- ユーティリティ ----------
def load_jsonl(path):
    if not path or not os.path.exists(path):
        return []
    out = []
    with open(path, "r", encoding="utf-8") as f:
        for ln in f:
            ln = ln.strip()
            if not ln:
                continue
            try:
                out.append(json.loads(ln))
            except Exception:
                pass
    return out

def write_jsonl(path, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

def ascii_fold(s: str) -> str:
    # 全角→半角 / NFKD 正規化 / アクセント除去
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s

def normalize_company_suffixes(s: str) -> str:
    # 会社語尾/記号を削る（Nissan Motor Co., Ltd. → nissan motor）
    s = s.lower()
    s = s.replace("&", " and ")
    s = re.sub(r"[.,'’`]", " ", s)
    s = re.sub(r"\b(company|co|corp|corporation|inc|ltd|llc|gmbh|ag|sa|sarl|s\.p\.a|pte|pty|plc|bv|有限会社|株式会社)\b", " ", s)
    s = re.sub(r"\b(motors?|motor\s+co|motor\s+company|automobile|automobiles|vehicle|vehicles)\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def norm_maker_name(name: str) -> str:
    if not name:
        return ""
    s = name.strip()
    s = ascii_fold(s)
    s = normalize_company_suffixes(s)
    # 例外マッピング（必要に応じて拡張）
    REPL = {
        "toyota motor": "toyota",
        "nissan motor": "nissan",
        "honda motor": "honda",
        "mitsubishi motors": "mitsubishi",
        "hyundai motor": "hyundai",
        "kia motors": "kia",
        "bmw ag": "bmw",
        "mercedes benz": "mercedes-benz",
        "vw": "volkswagen",
        "v w": "volkswagen",
        "triumph motor": "triumph",
        "kawasaki heavy industries": "kawasaki",
        "suzuki motor": "suzuki",
        "yamaha motor": "yamaha",
        "harley davidson": "harley-davidson",
    }
    if s in REPL:
        s = REPL[s]
    return s

MODEL_STOPWORDS = {"(car)", "(automobile)", "(vehicle)", "series", "class"}
def norm_model_name(name: str) -> str:
    if not name:
        return ""
    s = name.strip()
    s = ascii_fold(s)
    # 括弧内注記削除（末尾）
    s = re.sub(r"\s*$begin:math:text$[^)]*$end:math:text$$", "", s)
    # 記号統一
    s = s.replace("–", "-").replace("—", "-").replace("‐", "-")
    s = re.sub(r"[·•･・]", " ", s)
    # 連続空白
    s = re.sub(r"\s+", " ", s)
    # 末尾の series/class 等を除去
    for w in MODEL_STOPWORDS:
        s = re.sub(rf"\b{re.escape(w)}\b$", "", s, flags=re.I).strip()
    return s

def rf_ratio(a: str, b: str) -> int:
    if not HAVE_RF:
        # 簡易（完全一致=100 / 前方一致95 / トークン一致90 / else 0）
        if a == b:
            return 100
        if a.startswith(b) or b.startswith(a):
            return 95
        at = set(a.split()); bt = set(b.split())
        if at and bt and (at == bt or at.issubset(bt) or bt.issubset(at)):
            return 90
        return 0
    return fuzz.token_set_ratio(a, b)

def year_overlap(y1, y2) -> bool:
    # y: dict like {"start": 1999, "end": 2005}  Noneを無限扱い
    if not y1 or not y2:
        return True
    s1 = y1.get("start"); e1 = y1.get("end")
    s2 = y2.get("start"); e2 = y2.get("end")
    if s1 is None and e1 is None:
        return True
    if s2 is None and e2 is None:
        return True
    # None は広い区間扱い
    s1 = -10**9 if s1 is None else s1
    e1 =  10**9 if e1 is None else e1
    s2 = -10**9 if s2 is None else s2
    e2 =  10**9 if e2 is None else e2
    return not (e1 < s2 or e2 < s1)

# ---------- 読み込み＆整形 ----------
def ingest(paths, lang=None, source_tag=None):
    items = []
    for p in paths or []:
        for r in load_jsonl(p):
            maker_raw = (r.get("maker") or {}).get("name") or r.get("maker_name") or ""
            model_raw = r.get("model") or r.get("model_name") or r.get("itemLabel") or ""
            maker_n = norm_maker_name(maker_raw)
            model_n = norm_model_name(model_raw)
            if not maker_n or not model_n:
                continue
            years = r.get("years") or {}
            item = {
                "maker_raw": maker_raw,
                "maker_norm": maker_n,
                "model_raw": model_raw,
                "model_norm": model_n,
                "years": {
                    "start": years.get("start"),
                    "end": years.get("end"),
                },
                "kind": r.get("kind"),
                "lang": lang,
                "source": source_tag or r.get("source") or [],
                "raw": r,
            }
            # 参考: wikipedia pageid/title
            if "pageid" in r:
                item["pageid"] = r["pageid"]
            if "fulltitle" in r:
                item["title"] = r["fulltitle"]
            items.append(item)
    return items

# ---------- メーカークラスタ ----------
def cluster_makers(items, th=92):
    # maker_norm 単位→類似名をまとめて1クラスタに
    names = sorted({x["maker_norm"] for x in items if x["maker_norm"]})
    clusters = []
    used = set()
    for i, n in enumerate(names):
        if n in used:
            continue
        group = [n]
        used.add(n)
        for m in names[i+1:]:
            if m in used:
                continue
            if rf_ratio(n, m) >= th:
                group.append(m)
                used.add(m)
        clusters.append(group)
    # map
    maker_map = {}
    for grp in clusters:
        # 代表を多数決（最短長 or 出現回数最大）
        rep = sorted(grp, key=lambda s: (len(s), s))[0]
        for g in grp:
            maker_map[g] = rep
    return maker_map

# ---------- モデルクラスタ（メーカー内） ----------
def cluster_models(items_for_maker, th=92):
    # 同一メーカー中でモデル名をクラスタリング
    names = sorted({x["model_norm"] for x in items_for_maker if x["model_norm"]})
    clusters = []
    used = set()
    for i, n in enumerate(names):
        if n in used:
            continue
        group = [n]; used.add(n)
        for m in names[i+1:]:
            if m in used:
                continue
            score = rf_ratio(n, m)
            if score >= th:
                group.append(m); used.add(m)
        clusters.append(group)
    # map
    model_map = {}
    for grp in clusters:
        # 代表ラベルは最頻出 or 短い方
        rep = sorted(grp, key=lambda s: (len(s), s))[0]
        for g in grp:
            model_map[g] = rep
    return model_map

# ---------- マージ ----------
def merge_cluster(records):
    # 日本語・英語名の推定、別名、年の結合、ソース集約
    # 表示名: en/ja の両方を可能な限り埋める
    name_en_candidates = []
    name_ja_candidates = []
    aliases = set()
    years_list = []
    sources = set()
    kinds = set()
    maker_raws = set()

    for r in records:
        kinds.add(r.get("kind"))
        maker_raws.add(r.get("maker_raw"))
        y = r.get("years") or {}
        if y.get("start") or y.get("end"):
            years_list.append(y)
        src = r.get("source")
        if isinstance(src, list):
            for s in src:
                sources.add(s)
        elif isinstance(src, str):
            sources.add(src)
        # 言語別のモデル名候補
        rawname = r.get("model_raw") or r.get("model_norm")
        if r.get("lang") == "en":
            if rawname:
                name_en_candidates.append(rawname)
        elif r.get("lang") == "ja":
            if rawname:
                name_ja_candidates.append(rawname)
        else:
            # 言語未指定（vpic/wdなど）はエイリアス側へ
            if rawname:
                aliases.add(rawname)
        aliases.add(r.get("model_norm"))

    # 代表名の決定（頻出順→短さ）
    def pick_name(cands):
        if not cands:
            return None
        cnt = Counter([c.strip() for c in cands if c]).most_common()
        best = sorted([c for c, _ in cnt], key=lambda s: (len(s), s))[0]
        return best

    name_en = pick_name(name_en_candidates)
    name_ja = pick_name(name_ja_candidates)

    # 年の統合（min start / max end）
    start_vals = [y.get("start") for y in years_list if y.get("start") is not None]
    end_vals   = [y.get("end")   for y in years_list if y.get("end") is not None]
    years = {
        "start": min(start_vals) if start_vals else None,
        "end":   max(end_vals)   if end_vals else None,
    }

    out = {
        "maker_display": sorted(maker_raws, key=lambda s: (len(s), s))[0] if maker_raws else None,
        "model": {
            "name_en": name_en,
            "name_ja": name_ja,
            "aliases": sorted({a for a in aliases if a}),
        },
        "years": years,
        "sources": sorted(sources),
        "kinds_seen": sorted({k for k in kinds if k}),
    }
    return out

# ---------- メイン ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vpic", default=None)
    ap.add_argument("--wiki-ja", nargs="*", default=[])
    ap.add_argument("--wiki-en", nargs="*", default=[])
    ap.add_argument("--wd-cars", default=None)
    ap.add_argument("--wd-bikes", default=None)
    ap.add_argument("--out", required=True)
    ap.add_argument("--makers", default=None, help="メーカー名寄せマップの保存先（debug用）")
    ap.add_argument("--maker-th", type=int, default=92)
    ap.add_argument("--model-th", type=int, default=92)
    args = ap.parse_args()

    rows = []
    # vPIC
    if args.vpic:
        rows += ingest([args.vpic], lang=None, source_tag="vpic")
    # Wikipedia
    if args.wiki_ja:
        rows += ingest(args.wiki_ja, lang="ja", source_tag="ja.wikipedia")
    if args.wiki_en:
        rows += ingest(args.wiki_en, lang="en", source_tag="en.wikipedia")
    # Wikidata（車・バイクどちらも読み込むが、今回はkind使わず統合のみ）
    if args.wd_cars:
        rows += ingest([args.wd_cars], lang=None, source_tag="wikidata")
    if args.wd_bikes:
        rows += ingest([args.wd_bikes], lang=None, source_tag="wikidata")

    if not rows:
        print("No input rows.", file=sys.stderr)
        sys.exit(1)

    # 1) メーカー名寄せ
    maker_map = cluster_makers(rows, th=args.maker_th)
    if args.makers:
        os.makedirs(os.path.dirname(args.makers), exist_ok=True)
        with open(args.makers, "w", encoding="utf-8") as f:
            json.dump(maker_map, f, ensure_ascii=False, indent=2)

    # メーカー代表名に置き換え
    for r in rows:
        r["maker_rep"] = maker_map.get(r["maker_norm"], r["maker_norm"])

    # 2) メーカーごとに分桶
    buckets = defaultdict(list)
    for r in rows:
        buckets[r["maker_rep"]].append(r)

    # 3) モデルクラスタ→統合
    unified = []
    for maker_rep, items in buckets.items():
        model_map = cluster_models(items, th=args.model_th)
        # 代表モデルごとに束ねる
        clusters = defaultdict(list)
        for it in items:
            rep = model_map.get(it["model_norm"], it["model_norm"])
            clusters[rep].append(it)

        for model_rep, group in clusters.items():
            merged = merge_cluster(group)
            merged["maker"] = {
                "id": maker_rep,               # 名寄せ後の代表名（ID代わり）
                "aliases": sorted({x["maker_norm"] for x in group}),
                "display_candidates": sorted({x["maker_raw"] for x in group}),
            }
            merged["id"] = f"{maker_rep}|{model_rep}"
            # 代表モデル名（ID向けに英名優先で付けとく）
            merged["model"]["id_name"] = (merged["model"]["name_en"] or
                                          merged["model"]["name_ja"] or
                                          model_rep)
            unified.append(merged)

    # 4) 出力
    write_jsonl(args.out, unified)
    print(f"wrote {len(unified)} rows -> {args.out}")
    print("done.")

if __name__ == "__main__":
    main()