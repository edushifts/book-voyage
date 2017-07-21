"""
Book Voyage configuration file.
NOTE: copy this file to config.py and cater it to your own needs.
Keep in mind that changing certain variables requires changes in the front-end too.
"""

# SECURITY WARNING: Change this if you use Book Voyage on your own production server and keep it secret
SECRET_KEY = 'mqmz#+d=$x&m^tv1^aywcw7dbor+sqhs(#gjv9wh96(30lu7zq'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Define frontend-related variables - primarily for url generation in e-mails
HOST_FRONTEND = "http://127.0.0.1:4200/"  # Where Angular is hosted
PASSWORD_RESET_LINK = "signup/key/"
JOURNEY_LINK = "journey/"
MULTIPLE_REGISTRATIONS_ALLOWED = True  # Disabling this blocks a user from registering a single book multiple times

ALLOWED_HOSTS = ['*']  # Change this to back-end domain

# Cross-origins policy. Cater this to your front-end.
CORS_ORIGIN_ALLOW_ALL = True
# CORS_ORIGIN_WHITELIST = (
#     HOST_FRONTEND
# )

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases
# Since the production server uses postgresql, we will also during development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'db_name',
        'USER': 'db_user',
        'PASSWORD': 'db_pw',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

# Set up mail configuration
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_USE_TLS = True
# EMAIL_HOST = 'mail.example.com'
# EMAIL_PORT = 587
# EMAIL_HOST_USER = 'example'
# EMAIL_HOST_PASSWORD = 'hunter12'
# SERVER_EMAIL = 'now@edushifts.world'  # Only for messages to admins
# DEFAULT_FROM_EMAIL = 'EDUshifts Now! <now@edushifts.world>'
