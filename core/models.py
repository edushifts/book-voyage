# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.models import User
from djgeojson.fields import PointField
from django.db import models

class Author(models.Model):
    """
    class of authors:
    id - created automatically - key attribute
    first_name - string
    last_name - string
    bio - string
    date_of_birth - date
    """
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    bio = models.CharField(max_length=512)
    date_of_birth = models.DateField()

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return (self.first_name + " " + self.last_name)

class Book(models.Model):
    authors = models.ManyToManyField(Author)
    title = models.CharField(max_length=64)
    abstract = models.CharField(max_length=512)
    cover = models.ImageField
    #language = 

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return self.title

class BookInstance(models.Model):
    """class of bookinstances:
    id - created automatically
    owner - many-to-one (foreign key) with user
    holders - many-to-many with users
    """

    id = models.AutoField(
        primary_key=True,
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
    )
    access_code = models.CharField(
        max_length=64,
        unique=True,
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    holders = models.ManyToManyField(
        "BookHolding",
    )
    batch = models.ForeignKey(
        "BookBatch",
        on_delete=models.CASCADE,
    )
    arrived = models.BooleanField(
        default=False)

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return ("Book " + str(self.id) + " (owned by " + self.owner.first_name + " " + self.owner.last_name + ")")

class BookHolding(models.Model):
    """
    additional table for many-to-many relationship between books and holders
    keep ino about period of holding
    """
    holder = models.ForeignKey(User, on_delete=models.CASCADE)
    #receive_time = models.DateTimeField()
    message = models.CharField(max_length=140)
    review = models.CharField(max_length=512)
    is_owner = models.BooleanField(default=False)

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return (self.holder.first_name + " " + self.holder.last_name)

class BookLocation(models.Model):
    """
    notes about user travelling around the world
    using for finding of location of the book
    user - user
    time - starting time point in some location
    location - GeoIP2 object (we can use any other library)
    """
    id = models.AutoField(
        primary_key=True,
    )

    geom = PointField()

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )

    book_holding = models.ForeignKey(
        BookHolding,
        on_delete=models.CASCADE)

    time = models.DateTimeField()

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name + " (" + self.time.strftime("%Y-%m-%d %H:%M:%S") + ")"

class BookBatch(models.Model):
    event = models.CharField(max_length=64)
    country = models.CharField(max_length=64)
    geom = PointField()
    date = models.DateField()

    def __str__(self):
        return self.event + " (" + self.country + ")"

    class Meta:
        verbose_name_plural = "Book batches"