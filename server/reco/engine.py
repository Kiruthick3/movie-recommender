from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from core.db import col
from core.config import settings
from typing import List

_vec = None
_cached_matrix = None
_cached_ids = None

def _join_list(x):
    if isinstance(x, list):
        return " ".join(x)
    return x or ""

def _corpus_and_ids():
    docs = list(col('movies').find({}, {'tmdb_id': 1, 'title':1, 'overview':1, 'genres':1, 'keywords':1}))
    texts, ids = [], []
    for m in docs:
        texts.append(" ".join([
            m.get('title','') or '',
            m.get('overview','') or '',
            _join_list(m.get('genres',[])),
            _join_list(m.get('keywords',[]))
        ]))
        ids.append(m['tmdb_id'])
    return texts, ids

def fit_matrix():
    global _vec, _cached_matrix, _cached_ids
    texts, ids = _corpus_and_ids()
    if len(texts) < 2:
        _vec = None; _cached_matrix = None; _cached_ids = None
        return
    _vec = TfidfVectorizer(stop_words='english', min_df=max(1, settings.TFIDF_MIN_DF), ngram_range=(1,2))
    _cached_matrix = _vec.fit_transform(texts)
    _cached_ids = ids

def similar_to(tmdb_id: int, topn: int = 12) -> List[dict]:
    global _vec, _cached_matrix, _cached_ids
    if _cached_matrix is None:
        fit_matrix()
    if _cached_matrix is None:
        return []
    try:
        idx = _cached_ids.index(tmdb_id)
    except ValueError:
        return []
    sims = cosine_similarity(_cached_matrix[idx], _cached_matrix).ravel()
    order = np.argsort(-sims)
    out = []
    for j in order:
        if j == idx: 
            continue
        out.append({'tmdb_id': int(_cached_ids[j]), 'score': float(sims[j])})
        if len(out) >= topn: break
    return out
