# Book Voyage
 
***Empowering books to travel*** 

_This application was built for the [EDUshifts Now! book](https://www.edushifts.world/). That experiment has now concluded. Feel invited to repurpose this code however you see fit._

![platform preview](https://user-images.githubusercontent.com/4922048/183244879-69890ff8-bec6-4779-8112-e90fb9d83b80.png)

[![Build Status](https://travis-ci.org/edushifts/book-voyage.svg?branch=master)](https://travis-ci.org/edushifts/book-voyage)
[![Python Style guide](https://img.shields.io/badge/code_style-PEP8-yellowgreen.svg)](https://www.python.org/dev/peps/pep-0008/)

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

## How to run it?

The application has two components: a front-end based on Angular and a back-end based on Django. Interaction happens through an API. Users only use the front-end; administration is performed through Django.

### For Developers

#### Backend (Django Framework)
You will find the instructions for running the back-end [here](https://github.com/edushifts/book-voyage/blob/master/bookvoyage-backend/README.MD).

#### Frontend (Angular Framework)
You will find the instructions for running the front-end [here](https://github.com/edushifts/book-voyage/blob/master/bookvoyage-frontend/README.md)

#### General tips for unexperienced programmers
*All these are but humble suggestions from a recent learner.* You can use any major operating system, but a Linux (virtual) machine comes recommended if you want to work on the back-end. If you don't run Linux already, [this virtual machine](https://box.scotch.io/) is pretty great. Using a [virtual python environment](https://askubuntu.com/a/865644) also comes recommended. If you want to focus on Angular development, you may want to work in your native OS rather than a virtual machine to avoid some issues with automatic refreshing.
