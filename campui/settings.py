import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Application definition
INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'api',
    'analytics',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)



ROOT_URLCONF = 'campui.urls'
WSGI_APPLICATION = 'campui.wsgi.application'
TIME_ZONE = 'UTC'

SECRET_KEY = os.environ.get("CAMPUI_SECRET_KEY", "dev_not_for_prod")
DEBUG = "CAMPUI_DEBUG" in os.environ

ALLOWED_HOSTS = ["*"]

DATABASES = {
    'postgresql': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',

        'NAME': os.environ.get("CAMPUI_DB_NAME", "campui"),
        'USER': os.environ.get("CAMPUI_DB_USER", "charles"),
        'PASSWORD': os.environ.get("CAMPUI_DB_PASSWORD", "charles"),
        'HOST': os.environ.get("CAMPUI_DB_HOST", "localhost"),
        'PORT': os.environ.get("CAMPUI_DB_PORT", "5432"),
    }
}

DATABASES['default'] = DATABASES['postgresql']

#
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

# parameters for collectstatic
# STATIC_ROOT = 'static/'
#
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, "app/static"),
# ]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'debug': DEBUG,
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]