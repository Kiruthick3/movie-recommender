import nltk
import os

nltk_data_path = os.path.join(os.path.dirname(__file__), '../nltk_data')
nltk.data.path.append(nltk_data_path)

try:
    nltk.corpus.wordnet.ensure_loaded()
except LookupError:
    nltk.download('wordnet', download_dir=nltk_data_path)

try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon', download_dir=nltk_data_path)
