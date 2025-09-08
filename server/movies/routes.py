from flask import Blueprint, request, jsonify
from services.tmdb import search_movies, movie_details
from core.db import col
from reco.engine import fit_matrix, similar_to
from datetime import datetime

movies_bp = Blueprint('movies', __name__)
@movies_bp.get('/search')
def search():
    q = request.args.get('q','')
    page = int(request.args.get('page',1))
    if not q:
        return {'items': [], 'page': page, 'total_pages': 0}

    data = search_movies(q, page)   # this gives TMDB JSON (with "results")
    items = [
        {
            "id": m["id"],
            "tmdb_id": m["id"],
            "title": m["title"],
            "poster_path": f"https://image.tmdb.org/t/p/w500{m['poster_path']}" if m.get("poster_path") else None,
            "release_date": m.get("release_date"),
            "vote_average": m.get("vote_average"),
        }
        for m in data.get("results", [])
    ]
    return {
        "items": items,
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 1)
    }


@movies_bp.get('/<int:tmdb_id>')
def details(tmdb_id):
    data = movie_details(tmdb_id)
    genres = [g.get('name') for g in data.get('genres',[])]
    keywords = [k.get('name') for k in data.get('keywords',{}).get('keywords',[])]
    doc = {
        'tmdb_id': data['id'],
        'title': data.get('title'),
        'overview': data.get('overview',''),
        'genres': genres,
        'keywords': keywords,
        'poster_path': data.get('poster_path'),
        'release_date': data.get('release_date')
    }
    col('movies').update_one({'tmdb_id': data['id']}, {'$set': doc}, upsert=True)
    fit_matrix()
    return data

@movies_bp.get('/<int:tmdb_id>/recommendations')
def recs(tmdb_id):
    sims = similar_to(tmdb_id, topn=20)

    # Get movie details for the recommended IDs
    ids = [s['tmdb_id'] for s in sims]
    movies = list(col('movies').find({'tmdb_id': {'$in': ids}}, {"_id": 0}))

    # Map tmdb_id -> details
    movie_map = {m['tmdb_id']: m for m in movies}

    # Merge similarity score with movie data
    results = []
    for s in sims:
        m = movie_map.get(s['tmdb_id'])
        if m:
            m['score'] = s['score']
            results.append(m)

    return {'items': results, 'generated_at': datetime.utcnow().isoformat()}


@movies_bp.get('/')
def all_movies():
    movies = list(col('movies').find({}, {"_id": 0}))
    return jsonify(movies)
