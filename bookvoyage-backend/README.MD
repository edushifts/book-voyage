# Book Voyage Back-End

## From git clone to serving

1. You will first need to install Python, if you haven't yet. [Here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/development_environment) is a clear guide for multiple OSs.
2. You can install all required dependencies by running `pip install -r requirements.txt` in the `bookvoyage-backend` root folder.
3. We use [PostgreSQL](https://www.postgresql.org/download/) in production, which we highly recommend you also install (in favour of the easier SQLite database option). Once PostgreSQL is running, copy `config.default.py` to `config.py` and change the database variables to suit your needs.
4. Run: `python manage.py makemigrations`, then `python manage.py migrate`, and finally `python manage.py runserver 127.0.0.1:8000` (or the `ip:port` of your virtual machine).

If you go to the given address in your browser and see a page appear, that means you are in business and ready to contribute!

## Developer resources

You can take a look at our [wiki page](https://github.com/edushifts/book-voyage/wiki) for information on implementations.
