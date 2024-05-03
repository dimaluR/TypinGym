import logging
from firebase_admin import firestore
from app.firebase import firebase_app

db = firestore.client(firebase_app)


def get_default_config():
    default_config_doc_ref = db.collection("configurations").document("default")
    default_config_snapshot = default_config_doc_ref.get()
    return default_config_snapshot.to_dict()


def setup_new_user_config(user_id: str):
    doc_ref = db.collection("configurations").document(user_id)
    default_config = get_default_config()
    doc_ref.set(default_config)
    return default_config


def get_user_config(user_id: str) -> dict:
    try:
        doc_ref = db.collection("configurations").document(user_id)
        user_config = doc_ref.get()
        return user_config.to_dict() if user_config.exists else setup_new_user_config()
    except Exception:
        logging.exception(f"could not retrieve user {user_id} config")
