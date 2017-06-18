from leaflet.admin import LeafletGeoAdmin
from django.contrib import admin

# Register your models here.
from .models import Author, Book, BookInstance, BookHolding, BookOwning, BookBatch

admin.site.register(Author)
admin.site.register(Book)
admin.site.register(BookInstance)
admin.site.register(BookHolding, LeafletGeoAdmin)
admin.site.register(BookOwning, LeafletGeoAdmin)
admin.site.register(BookBatch, LeafletGeoAdmin)
