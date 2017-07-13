from leaflet.admin import LeafletGeoAdmin
from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

# Register models
from .models import Author, Book, BookInstance, BookHolding, BookOwning, BookBatch
from django.contrib.auth.models import User

class BookResource(resources.ModelResource):
    class Meta:
        model = Book

class BookAdmin(ImportExportModelAdmin):
    resource_class = BookResource

class BookCodeResource(resources.ModelResource):
    class Meta:
        model = BookInstance
        exclude = ('id','ownings', 'holdings', 'arrived')
        import_id_fields = ['book_code']
        skip_unchanged = True

class BookCodeAdmin(ImportExportModelAdmin):
    resource_class = BookCodeResource

class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'groups', 'username')
        import_id_fields = ['username']
        skip_unchanged = True

class UserAdmin(ImportExportModelAdmin):
    resource_class = UserResource
    pass

admin.site.register(Author)
admin.site.register(Book, BookAdmin)
admin.site.register(BookInstance, BookCodeAdmin)
admin.site.register(BookHolding, LeafletGeoAdmin)
admin.site.register(BookOwning, LeafletGeoAdmin)
admin.site.register(BookBatch, LeafletGeoAdmin)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)