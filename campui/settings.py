import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Application definition
INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'rest_framework',
    'api',
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

SECRET_KEY = "dev_not_for_prod"
DEBUG = True
ALLOWED_HOSTS = []

DATABASES = {
    'postgresql': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'campui',
        'USER': 'charles',
        'PASSWORD': 'charles',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

DATABASES['default'] = DATABASES['postgresql']

# prod param overwriting
try:
    import prod_settings

    SECRET_KEY = prod_settings.SECRET_KEY
    DEBUG = prod_settings.DEBUG
    ALLOWED_HOSTS = prod_settings.ALLOWED_HOSTS

    DATABASES['postgresql']['NAME'] = prod_settings.DB_NAME,
    DATABASES['postgresql']['HOST'] = prod_settings.DB_HOST,
    DATABASES['postgresql']['PORT'] = prod_settings.DB_PORT,
    DATABASES['postgresql']['USER'] = prod_settings.DB_USER,
    DATABASES['postgresql']['PASSWORD'] = prod_settings.DB_PASSWORD,

except ImportError:
    pass

