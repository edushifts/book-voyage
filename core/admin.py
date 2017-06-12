from leaflet.admin import LeafletGeoAdmin
from django.contrib import admin

# Register your models here.
from .models import Author, Book, BookInstance, BookHolding, BookLocation, BookBatch

admin.site.register(Author)
admin.site.register(Book)
admin.site.register(BookInstance)
admin.site.register(BookHolding)
admin.site.register(BookLocation, LeafletGeoAdmin)
admin.site.register(BookBatch, LeafletGeoAdmin)