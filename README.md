# Book Voyage
 
***Empowering books to travel***

![platform preview](https://edushifts.world/docs/BookVoyage_preview.png)

## Ready for a new kind of journey?

Awesome! You made it to our GitHub page :orange_book: :rocket:

We're a tribe of [EDUshifters][EDUshifts] with a mission: giving books movement, and giving movements books.

Book Voyage is a web-based platform to launch and follow travelling books as they move across the globe.
 
This document (the README file) is a hub to give you some information about the project. Jump straight to one of the sections below, or just scroll down to find out more.
 
* [The first voyage (or: what does it do?)](#the-first-voyage)
* [What do we need?](#what-do-we-need)
* [How to run it?](#how-to-run-it)
* [How can you get involved?](#get-involved)
 
## The first voyage

It all started with a [crowdfunding campaign](https://www.generosity.com/education-fundraising/edushifts-now-collective-book-initiative) with a simple premise: what if we could distribute our book not in any regular fashion, but as part of a collective game? What if all books would be given to participants at a single conference, each with a final destination attached to it? **What if books could travel and connect people?**

This sparked us to test the theory of *six degrees of separation* that would exist between any two people. Instead of simply sharing ideas through a passive book, we wished to create a network of people; a movement united by having shared the ideas in our book.

**This concept is a pilot that we would love to involve you in. If proven succesful, let's make sure many more book voyages will happen across the globe!**
 
## What do we need?
 
**You!** In specific, we are looking for (Angular) front-end developers who are looking for a Javascript challenge in map APIs, as well as Django/Python developers to contribute to our back-end implementation.

Please note that the current version is still very much work-in-progress and is not yet suited for a production environment. We are very open to suggestions to extend the platform in interesting directions, so please leave a message if you have a great new feature in mind.

## How to run it?

### Backend (Django Framework)

#### Beginner tips
You can use any major operating system, but a Linux (virtual) machine is recommended. If you don't run Linux already, [this virtual machine](https://box.scotch.io/) is pretty great. Using a [virtual python environment](https://askubuntu.com/a/865644) also comes recommended.

#### From git clone to serving

1. You will first need to install Python, if you haven't yet. [Here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/development_environment) is a clear guide for multiple OSs.
2. You can install all required dependencies by running `pip install -r requirements.txt` in the `bookvoyage-backend` root folder.
3. We use [PostgreSQL](https://www.postgresql.org/download/) in production, which we highly recommend you also install (in favour of the easier SQLite database option). Once PostgreSQL is running, copy `config.default.py` to `config.py` and change the database variables to suit your needs.
4. To allow the database to store geo-objects, please run `sudo apt-get install gdal-bin`. Note that we have not tried installing this in [Windows](https://gis.stackexchange.com/questions/2276/installing-gdal-with-python-on-windows).
5. Run: `python manage.py makemigrations`, then `python manage.py migrate`, and finally `python manage.py runserver 127.0.0.1:8000` (or the `ip:port` of your virtual machine).

If you go to the given address in your browser and see the current front-end, that means you are in business and ready to contribute!

You can take a look at our [wiki page](https://github.com/edushifts/book-voyage/wiki) for information on implementations.

### Frontend (Angular)

*We are currently working on separate instructions for the front-end, which will be written once the front- and backend have been split.*

## Get involved

If you run into any issues or would just like to get in contact with us, then join our Gitter!

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/Book-Voyage/Lobby)
 
[EDUshifts]: https://www.edushifts.world/
