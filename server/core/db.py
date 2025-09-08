from flask_pymongo import PyMongo

mongo = PyMongo()

def col(name):
    return mongo.db[name]
