from leaflet.admin import LeafletGeoAdmin
from django.contrib import admin

# Register your models here.
from .models import Author, Book, BookInstance, BookHolding, BookOwnerLoc, BookBatch

admin.site.register(Author)
admin.site.register(Book)
admin.site.register(BookInstance)
admin.site.register(BookHolding, LeafletGeoAdmin)
admin.site.register(BookOwnerLoc, LeafletGeoAdmin)
admin.site.register(BookBatch, LeafletGeoAdmin)
