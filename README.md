# Book Voyage
 
***Empowering books to travel***

## Ready for a new kind of journey?

Awesome! You made it to our GitHub page :orange_book: :rocket:

We're a tribe of [EDUshifters][EDUshifts] with a mission: giving books movement, and giving movements books.

Book Voyage is a web-based platform to launch and follow travelling books as they move across the globe.
 
This document (the README file) is a hub to give you some information about the project. Jump straight to one of the sections below, or just scroll down to find out more.
 
* [The first voyage (or: what does it do?)](#the-first-voyage)
* [What do we need?](#what-do-we-need)
* [How can you get involved?](#get-involved)
* [How to run it?](#how-to-run-it)
 
## The first voyage

It all started with a [crowdfunding campaign](https://www.generosity.com/education-fundraising/edushifts-now-collective-book-initiative) with a simple premise: what if we could distribute our book not in any regular fashion, but as part of a collective game? What if all books would be given to participants at a single conference, each with a final destination attached to it? **What if books could travel and connect people?**

This sparked us to test the theory of *six degrees of separation* that would exist between any two people. Instead of simply sharing ideas through a passive book, we wished to create a network of people; a movement united by having shared the ideas in our book.

**This concept is a pilot that we would love to involve you in. If proven succesful, let's make sure many more book voyages will happen across the globe!**
 
## What do we need?
 
**You!** In specific, we are looking for (Angular) front-end developers who are looking for a Javascript challenge in map APIs, as well as Django/Python developers to contribute to our back-end implementation.

We are very open to suggestions to extend the platform in interesting directions, so please leave a message if you have a great new feature in mind.

## How to run it?

The current version of Book Voyage is a skeleton website: it does not yet do any of the things we want it to do. However, by ***June 14th*** we want to have a first production version out, so you get a real opportunity to shape this project in the days to come. Excitement! :grin:

You can use any major operating system, but a Linux (virtual) machine is recommended. If you don't run Linux already, [this virtual machine](https://box.scotch.io/) is pretty great. Using a [virtual python environment](https://askubuntu.com/a/865644) also comes recommended.

1. You will need to install [Django](https://www.djangoproject.com/) and its dependencies. [Here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/development_environment) is a clear guide.
2. We use [PostgreSQL](https://www.postgresql.org/download/) in production, which we highly recommend you also install (in favour of the easier SQLite database option). You will need the python interface [psycopg2](http://initd.org/psycopg/docs/install.html) to use it.
3. Once PostgreSQL is running and you have downloaded the git repository, go to /bookvoyage/settings.py and change the database variables to suit your needs.
4. Run: `python manage.py makemigrations`, then `python manage.py migrate`, and finally `python manage.py runserver 127.0.0.1:8000` (or the IP of your virtual machine).

If you go to the given address in your browser and see text appearing, that means you are in business and ready to contribute!

## Get involved

If you run into any issues or would just like to get in contact with us, then join our Gitter!

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/Book-Voyage/Lobby)
 
[EDUshifts]: https://www.edushifts.world/
