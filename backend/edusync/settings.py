"""
Django settings for EduSync AI backend.
Stateless processing server — no database needed.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-edusync-local-dev-key-change-in-production"
)

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# ---------------------
# Installed Apps
# ---------------------
INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
]

# ---------------------
# Middleware
# ---------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ---------------------
# CORS Configuration
# ---------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4321",
    "http://127.0.0.1:4321",
]
CORS_ALLOW_METHODS = ["GET", "POST", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = [
    "accept",
    "content-type",
    "authorization",
    "x-requested-with",
]

# ---------------------
# REST Framework
# ---------------------
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.MultiPartParser",
        "rest_framework.parsers.FormParser",
    ],
    "UNAUTHENTICATED_USER": None,
}

# ---------------------
# URL Configuration
# ---------------------
ROOT_URLCONF = "edusync.urls"

# ---------------------
# Templates (minimal — API only)
# ---------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "edusync.wsgi.application"

# ---------------------
# Database — NONE (stateless)
# ---------------------
DATABASES = {}

# ---------------------
# File Upload Limits
# ---------------------
DATA_UPLOAD_MAX_MEMORY_SIZE = 25 * 1024 * 1024  # 25MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 25 * 1024 * 1024  # 25MB

# Temporary upload directory
FILE_UPLOAD_TEMP_DIR = os.path.join(BASE_DIR, "tmp_uploads")

# ---------------------
# Static Files
# ---------------------
STATIC_URL = "static/"

# ---------------------
# Default auto field
# ---------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------
# Timezone & Language
# ---------------------
LANGUAGE_CODE = "es"
TIME_ZONE = "America/Lima"
USE_I18N = True
USE_TZ = True

# ---------------------
# History Directory
# ---------------------
HISTORY_DIR = os.path.join(BASE_DIR, "history")
os.makedirs(HISTORY_DIR, exist_ok=True)

# ---------------------
# API Keys (from .env)
# ---------------------
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NOTION_DB_ID = os.getenv("NOTION_DB_ID")
