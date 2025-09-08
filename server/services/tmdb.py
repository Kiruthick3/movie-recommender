import requests
from core.config import settings
from core.db import col
from datetime import datetime

BASE = "https://api.themoviedb.org/3"
HEADERS = {"accept": "application/json"}

def _get(path, params=None):
    p = {'api_key': settings.TMDB_API_KEY}
    if params: p.update(params)
    r = requests.get(f"{BASE}{path}", params=p, headers=HEADERS, timeout=10)
    r.raise_for_status()
    return r.json()

def movie_details(tmdb_id: int):
    key = f"tmdb:movie:{tmdb_id}"
    cache = col('cache').find_one({'key': key})
    if cache:
        return cache['payload']

    data = _get(f"/movie/{tmdb_id}", {'append_to_response': 'credits,keywords'})

    # keep full cast objects with images
    cast = [
        {
            "id": c["id"],
            "name": c["name"],
            "character": c.get("character"),
            "profile_path": f"https://image.tmdb.org/t/p/w200{c['profile_path']}" if c.get("profile_path") else None
        }
        for c in data.get("credits", {}).get("cast", [])[:12]  # top 12 cast
    ]
    data["cast"] = cast

    col('cache').insert_one({'key': key, 'payload': data, 'ttl': datetime.utcnow()})
    return data


def search_movies(q: str, page: int = 1):
    return _get("/search/movie", {'query': q, 'page': page})
