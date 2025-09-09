from flask import Blueprint, request, abort
from core.db import col
from utils.security import auth_required, current_user_id
from bson import ObjectId

import nltk

from nltk.sentiment import SentimentIntensityAnalyzer

users_bp = Blueprint('users', __name__)
_sia = SentimentIntensityAnalyzer()

# ------------------ Helper ------------------
def clean_mongo(doc):
    """Convert ObjectId fields to strings so Flask JSON can serialize."""
    if not doc:
        return doc
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
    return doc


# ------------------ Favorites ------------------
@users_bp.post('/favorites')
@auth_required
def fav_add():
    j = request.get_json(force=True)
    tmdb_id = int(j.get('tmdb_id'))
    uid = ObjectId(current_user_id())

    col('favorites').update_one(
        {'user_id': uid, 'tmdb_id': tmdb_id},
        {'$setOnInsert': {'user_id': uid, 'tmdb_id': tmdb_id}},
        upsert=True
    )

    items = list(col('favorites').find({'user_id': uid}, {'_id': 0}))
    items = [clean_mongo(d) for d in items]

    return {'ok': True, 'items': items}


@users_bp.get('/favorites')
@auth_required
def fav_list():
    uid = ObjectId(current_user_id())
    items = list(col('favorites').find({'user_id': uid}, {'_id': 0}))
    items = [clean_mongo(d) for d in items]
    return {'items': items}


@users_bp.delete('/favorites/<int:tmdb_id>')
@auth_required
def remove_favorite(tmdb_id):
    uid = ObjectId(current_user_id())
    col('favorites').delete_one({'user_id': uid, 'tmdb_id': tmdb_id})

    items = list(col('favorites').find({'user_id': uid}, {'_id': 0}))
    items = [clean_mongo(d) for d in items]

    return {'ok': True, 'items': items}


# ------------------ Ratings ------------------
@users_bp.post('/ratings')
@auth_required
def rate():
    j = request.get_json(force=True)
    tmdb_id = int(j.get('tmdb_id'))
    rating = int(j.get('rating', 0))
    review = j.get('review', '')

    sent = _sia.polarity_scores(review)['compound'] if review else 0.0
    uid = ObjectId(current_user_id())

    col('ratings').insert_one({
        'user_id': uid,
        'tmdb_id': tmdb_id,
        'rating': rating,
        'review': review,
        'sentiment': float(sent)
    })

    return {'ok': True, 'sentiment': sent}


@users_bp.get('/ratings/<int:tmdb_id>')
def get_ratings(tmdb_id):
    items = list(col('ratings').find(
        {'tmdb_id': tmdb_id},
        {'_id': 0, 'user_id': 1, 'rating': 1, 'review': 1}
    ))

    for item in items:
        uid = item.get("user_id")
        if isinstance(uid, str):
            try:
                uid = ObjectId(uid)
            except:
                uid = None

        user = col('users').find_one({'_id': uid}, {'name': 1}) if uid else None
        item['username'] = user.get('name') if user and user.get('name') else "Anonymous"

        item = clean_mongo(item)  

    return {"items": items}


# ------------------ Personalized Recs ------------------
@users_bp.get('/recs')
@auth_required
def personalized():
    uid = current_user_id()

    # 1) Gather favorites (ints)
    favs = [int(f['tmdb_id']) for f in col('favorites').find(
        {'user_id': uid}, {'_id': 0, 'tmdb_id': 1}
    )]

    # 2) If no favorites → show nothing (UI will display the hint)
    if not favs:
        return {'items': []}

    # 3) Aggregate recommendations from the engine
    from reco.engine import similar_to
    agg = {}  # tmdb_id -> score

    for mid in favs:
        try:
            recs = similar_to(int(mid), topn=20) or []
        except Exception as e:
            print(f"[recs] similar_to failed for {mid}: {e}")
            continue

        for r in recs:
            try:
                rid = int(r.get('tmdb_id'))
            except Exception:
                continue

            # Skip invalid/duplicate/own favorites
            if rid in favs:
                continue

            score = float(r.get('score', 0.0))
            if score <= 0:
                continue

            if rid not in agg or score > agg[rid]:
                agg[rid] = score

    # Nothing from the engine? Show nothing.
    if not agg:
        return {'items': []}

    # 4) Join with movies we actually have in DB
    ids = list(agg.keys())
    movies = list(col('movies').find({'tmdb_id': {'$in': ids}}, {'_id': 0}))
    present_ids = {m['tmdb_id'] for m in movies}
    missing = [i for i in ids if i not in present_ids]
    if missing:
        print(f"[recs] recommended IDs missing from movies collection: {missing}")

    # Attach scores and sort
    for m in movies:
        m['score'] = agg.get(m['tmdb_id'], 0.0)
    movies.sort(key=lambda x: x['score'], reverse=True)

    items = movies[:20]
    if items:
        return {'items': items}

    # 5) Fallback: within-DB genre overlap (still personalized)
    fav_docs = list(col('movies').find(
        {'tmdb_id': {'$in': favs}}, {'_id': 0, 'tmdb_id': 1, 'genres': 1}
    ))
    fav_genres = {g for d in fav_docs for g in (d.get('genres') or [])}

    if fav_genres:
        items = list(col('movies').find(
            {'genres': {'$in': list(fav_genres)}, 'tmdb_id': {'$nin': favs}},
            {'_id': 0}
        ).limit(20))
        return {'items': items}

    # 6) Nothing matched at all
    return {'items': []}


# ------------------ Profile ------------------
@users_bp.get('/profile')
@auth_required
def profile():
    try:
        uid = ObjectId(current_user_id())
        user = col('users').find_one({'_id': uid}, {'password_hash': 0})
        if not user:
            abort(404, "User not found")

        user = clean_mongo(user)
        return {'id': str(user['_id']), 'email': user.get('email'), 'name': user.get('name', '')}
    except Exception as e:
        print("PROFILE ERROR:", e)
        abort(500)
