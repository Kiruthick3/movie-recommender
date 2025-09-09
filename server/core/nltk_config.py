import os
import nltk

# Path relative to core folder
nltk_data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../nltk_data'))

if not os.path.exists(nltk_data_path):
    raise RuntimeError("nltk_data folder not found!")

# Insert the path before any NLTK import
nltk.data.path.insert(0, nltk_data_path)

# Optional: ensure essential resources are loaded
try:
    nltk.corpus.wordnet.ensure_loaded()
except LookupError:
    raise RuntimeError("WordNet not found in nltk_data folder")

try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    raise RuntimeError("VADER lexicon not found in nltk_data folder")
