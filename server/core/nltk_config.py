import os
import nltk

nltk_data_path = os.getenv("NLTK_DATA", "nltk_data")
os.makedirs(nltk_data_path, exist_ok=True)
nltk.data.path.append(nltk_data_path)

# Auto-download if missing
for resource in ["wordnet", "omw-1.4", "vader_lexicon"]:
    try:
        nltk.data.find(f"corpora/{resource}")
    except LookupError:
        nltk.download(resource, download_dir=nltk_data_path)
