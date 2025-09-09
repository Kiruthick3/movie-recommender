import nltk
import os

# Ensure NLTK looks in the correct path
nltk_data_path = os.path.join(os.environ.get("VIRTUAL_ENV", ""), "nltk_data")
if nltk_data_path not in nltk.data.path:
    nltk.data.path.append(nltk_data_path)
