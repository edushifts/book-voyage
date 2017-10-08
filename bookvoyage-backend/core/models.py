# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from djgeojson.fields import PointField  # Holds


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
        return self.first_name + " " + self.last_name


class Book(models.Model):
    """
    class of books - unique published works in circulation
    abstract - contains summary of book
    # cover - contains cover image of book
    """
    title = models.CharField(max_length=64)
    authors = models.ManyToManyField(
        Author,
        blank=True
    )
    abstract = models.CharField(
        max_length=512,
        blank=True,
        default=""
    )
    # cover = models.ImageField(upload_to = "bookCovers")

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        """
        return self.title + " | " + str(self.id)


class BookInstance(models.Model):
    """
    class of book instances: physical copies of a book
    id - explicitly made as key attribute
    book_code - unique, secret identifier to gain access to write ability
    book - refers to unique book object
    batch - object with when and where the book was released
    arrived - whether the book arrived at its owner already
    """

    id = models.AutoField(
        primary_key=True,
    )
    book_code = models.CharField(
        max_length=9,
        unique=True,
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
    )
    batch = models.ForeignKey(
        "BookBatch",
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )
    arrived = models.BooleanField(
        default=False,
    )

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        Returns book id, and if already assigned, also the owner.
        """
        if len(BookOwning.objects.filter(book_instance=self.id).values('owner__username')) >= 1:
            return ("Book #" + str(self.id) + " (owned by "
                    + BookOwning.objects.filter(book_instance=self.id).values('owner__username')
                    .order_by("time").last()["owner__username"]) + ")"
        else:
            return "Book #" + str(self.id)


class BookOwning(models.Model):
    """
    Describes an owning: an owner and owner location
    owner - user that owns a book
    secondary - whether this owning should be assigned later than primary ownings
    book_instance - the assigned book instance; the book this owner owns
    time - date and time of registering on the platform
    message - a personal message attached and publicly displayed on the front-end
    location - geometry object containing a point on the world map
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    secondary = models.BooleanField(
        default=False
    )
    book_instance = models.ForeignKey(
        BookInstance,
        related_name='ownings',
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )
    time = models.DateTimeField()
    message = models.CharField(
        max_length=140,
        blank=True,
        default="",
    )
    location = PointField()

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        Returns first and last names. If these are missing, the username is displayed instead.
        """
        if len(self.owner.first_name) >= 1 and len(self.owner.last_name) >= 1:
            return self.owner.first_name + " " + self.owner.last_name + " at " + str(self.time)
        else:
            return self.owner.username + " at " + str(self.time)


class BookHolding(models.Model):
    """
    Describes a holding: a holder and holding location
    holder - user that registered the book and is holding it
    book_instance - refers to book copy held
    time - time of registration
    message - a personal message attached and publicly displayed on the front-end
    location - geometry object containing a point on the world map
    """
    holder = models.ForeignKey(
        User,
        related_name='holdings',
        on_delete=models.CASCADE,
    )
    book_instance = models.ForeignKey(
        BookInstance,
        related_name='holdings',
        on_delete=models.CASCADE,
    )
    time = models.DateTimeField()
    message = models.CharField(
        max_length=140,
        blank=True,
        default="",
    )
    location = PointField()

    def __str__(self):
        """
        String for representing the MyModelName object (in Admin site etc.)
        Returns first and last names. If these are missing, the username is displayed instead.
        """
        if len(self.holder.first_name) >= 1 and len(self.holder.last_name) >= 1:
            return self.holder.first_name + " " + self.holder.last_name + " at " + str(self.time)
        else:
            return self.holder.username + " at " + str(self.time)

    class Meta:
        ordering = ('book_instance', 'time')


class BookBatch(models.Model):
    """
    Describes a book release event
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
        return self.event + " (" + self.country + ") | " + str(self.id)

    class Meta:
        verbose_name_plural = "Book batches"


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        related_name='profile'
    )
    url = models.URLField()

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name_plural = "User Profile"
