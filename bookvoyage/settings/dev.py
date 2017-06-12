from bookvoyage.settings.base import *
# Contains personal development set-up

ALLOWED_HOSTS = ['127.0.0.1']

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases
# Since the production server uses postgresql, we will also during development

# Make sure to fill in your own database credentials here:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'databaseName',
        'USER': 'userName',
        'PASSWORD': 'password',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

# SECURITY WARNING: keep the secret key used in production secret!
# Change this if you use Book Voyage on your own server!
SECRET_KEY = 'mqmz#+d=$x&m^tv1^aywcw7dbor+sqhs(#gjv9wh96(30lu7zq'