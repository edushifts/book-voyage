# Import Django admin classes
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

# Import maps library for location fields
from leaflet.admin import LeafletGeoAdmin

# Import classes to deal with file import/export
from import_export import resources
from import_export.admin import ImportExportModelAdmin

# Register models
from .models import Author, Book, BookInstance, BookHolding, BookOwning, BookBatch
from django.contrib.auth.models import User


"""
Define import/export resources
"""


class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'username')
        import_id_fields = ['username']
        skip_unchanged = True


class BookResource(resources.ModelResource):
    class Meta:
        model = Book


class BookCodeResource(resources.ModelResource):
    class Meta:
        model = BookInstance
        exclude = ('id', 'ownings', 'holdings', 'arrived')
        import_id_fields = ['book_code']
        skip_unchanged = True


"""
Define administration panels
"""


class BookAdmin(ImportExportModelAdmin):
    resource_class = BookResource


class BookOwningAdmin(LeafletGeoAdmin):
    list_display = ('__str__', 'book_instance', 'secondary',)
    list_filter = ('secondary',)


class BookHoldingAdmin(LeafletGeoAdmin):
    list_display = ('__str__', 'book_instance', 'time',)


class BookInstanceAdmin(ImportExportModelAdmin):
    resource_class = BookCodeResource
    list_display = ('__str__', 'batch', 'arrived',)
    list_filter = ('batch', 'arrived',)


"""
Override User panels to require the email field to be filled in
"""


class EmailRequiredMixin(object):
    def __init__(self, *args, **kwargs):
        super(EmailRequiredMixin, self).__init__(*args, **kwargs)
        # make user email field required
        self.fields['email'].required = True


class MyUserCreationForm(EmailRequiredMixin, UserCreationForm):
    pass


class MyUserChangeForm(EmailRequiredMixin, UserChangeForm):
    pass


class UpgradedUserAdmin(UserAdmin, ImportExportModelAdmin):
    resource_class = UserResource
    form = MyUserChangeForm
    add_form = MyUserCreationForm
    add_fieldsets = ((None, {'fields': ('username', 'email',
                                        'password1', 'password2'), 'classes': ('wide',)}),)


"""
Register administration panels
"""


admin.site.register(Author)
admin.site.register(Book, BookAdmin)
admin.site.register(BookInstance, BookInstanceAdmin)
admin.site.register(BookHolding, BookHoldingAdmin)
admin.site.register(BookOwning, BookOwningAdmin)
admin.site.register(BookBatch, LeafletGeoAdmin)
admin.site.unregister(User)
admin.site.register(User, UpgradedUserAdmin)
