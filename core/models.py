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
    date_of_birth = models.DateField()
    bio = models.CharField(max_length=512)

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return (self.first_name + " " + self.last_name)

class Book(models.Model):
    """
    class of books - unique published work in circulation
    abstract - contains summary of book
    cover - contains cover image of book
    """
    title = models.CharField(max_length=64)
    authors = models.ManyToManyField(Author)
    abstract = models.CharField(max_length=512)
    cover = models.ImageField(upload_to = "bookCovers")

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return self.title

class BookInstance(models.Model):
    """
    class of book instances: physical copies of a book
    id - explicitly made as key attribute
    access_code - unique, secret identifier
    book - refers to unique book object
    batch - object with when and where it was released
    arrived - whether the book has arrived at owner already
    """

    id = models.AutoField(
        primary_key=True,
    )
    access_code = models.CharField(
        max_length=64,
        unique=True,
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
    )
    batch = models.ForeignKey(
        "BookBatch",
        on_delete=models.CASCADE,
    )
    arrived = models.BooleanField(
        default=False,
    )

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        Returns book id, and unique username.
        """
        return ("Book #" + str(self.id) + " (owned by " + BookOwning.objects.filter(book_instance=self.id).values('owner__username').order_by("time").last()["owner__username"]) + ")"
        
class BookOwning(models.Model):
    """
    table that tracks owner and owner location
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    book_instance = models.ForeignKey(
        BookInstance,
        on_delete=models.CASCADE,
    )
    time = models.DateTimeField()
    message = models.CharField(max_length=512)
    location = PointField()

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        Returns first and last names. If these are missing, the username is displayed instead.
        """
        if len(self.owner.first_name) >= 1 and len(self.owner.last_name) >= 1:
        	return (self.owner.first_name + " " + self.owner.last_name + " at " + str(self.time))
        else: 
        	return (self.owner.username + " at " + str(self.time))

class BookHolding(models.Model):
    """
    describes action of holding a book instance at a particular moment
    holder - user that registered the book
    book_instance - refers to book copy
    time - time of registration
    message - personal message posted by user at location
    location - place of registration
    """
    holder = models.ForeignKey(
    	User, 
    	on_delete=models.CASCADE,
    )
    book_instance = models.ForeignKey(
        BookInstance, 
        on_delete=models.CASCADE,
    )
    time = models.DateTimeField()
    message = models.CharField(max_length=512)
    location = PointField()

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        if len(self.holder.first_name) >= 1 and len(self.holder.last_name) >= 1:
        	return (self.holder.first_name + " " + self.holder.last_name + " at " + str(self.time))
        else: 
        	return (self.holder.username + " at " + str(self.time))
		#If no first name is enetered then the username is displayed (otherwise there would be no holder name)


class BookBatch(models.Model):
    """
    describes book release event
    event - event name
    country - country name
    location - place of distribution
    date - first day of distribution (will default to time 00:00)
    """
    event = models.CharField(max_length=64)
    country = models.CharField(max_length=64)
    location = PointField()
    date = models.DateField()

    def __str__(self):
        return self.event + " (" + self.country + ")"

    class Meta:
        verbose_name_plural = "Book batches"
