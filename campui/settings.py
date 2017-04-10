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
    import campui.aws_dev_settings as prod_settings

    SECRET_KEY = prod_settings.SECRET_KEY
    DEBUG = prod_settings.DEBUG
    ALLOWED_HOSTS = prod_settings.ALLOWED_HOSTS

    DATABASES['default']['NAME'] = prod_settings.DB_NAME
    DATABASES['default']['HOST'] = prod_settings.DB_HOST
    DATABASES['default']['PORT'] = prod_settings.DB_PORT
    DATABASES['default']['USER'] = prod_settings.DB_USER
    DATABASES['default']['PASSWORD'] = prod_settings.DB_PASSWORD

except ImportError:
    print("No settings for prod, asserting dev")

#
STATIC_URL = '/static/'

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