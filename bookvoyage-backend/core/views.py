from django.contrib.auth import get_user_model
from django.contrib.auth.models import User, Group
from rest_framework.exceptions import ParseError
from rest_framework.permissions import IsAuthenticated

from .models import BookInstance, BookBatch, BookHolding, BookOwning
from core.serializers import BookInstanceSerializer, BookBatchSerializer, BookHoldingSerializer, \
    BookHoldingWriteSerializer, PreferencesSerializer, Preferences, UserDetailsSerializerWithEmail
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import viewsets, status


class BookInstanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    Contains all book instances
    """
    permission_classes = ()
    authentication_classes = ()

    queryset = BookInstance.objects.all()
    serializer_class = BookInstanceSerializer

class BookInstanceViewSetMin(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.\
    Contains only book instances with at least one past holding
    Used to save resources and loading time
    """
    permission_classes = ()
    authentication_classes = ()

    queryset = BookInstance.objects.exclude(holdings__isnull=True)
    serializer_class = BookInstanceSerializer

class BookBatchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = ()
    authentication_classes = ()

    queryset = BookBatch.objects.all()
    serializer_class = BookBatchSerializer

# UNUSED
# class BookHoldingViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     This viewset automatically provides `list` and `detail` actions.
#     """
#     queryset = BookHolding.objects.all()
#     serializer_class = BookHoldingSerializer

def get_book(code):
    """
    Takes a secret BookInstance access code and converts it to the public BookInstance id.
    If the given code has no corresponding book, it returns -1.

    If the BookInstance exists, it will check if an owner is already assigned to it.
    If not, it will assign a currently book-less owner to it.
    """
    try:
        code = code.upper()
        book = BookInstance.objects.get(book_code=code)
        book_id = book.id

        if not book.ownings.exists():
            # Find ownings without a book instance attached
            owner_query = BookOwning.objects.filter(book_instance__isnull=True)
            # owner_secondary_query = User.objects.filter(groups__name='SecondaryOwnerWithoutBook')
            if owner_query.filter(secondary=False).exists():
                chosen_owning = owner_query.filter(secondary=False).first()
                # Add owner to this book instance
                book.ownings.add(chosen_owning)
            elif owner_query.filter(secondary=True).exists():
                chosen_owning = owner_query.filter(secondary=True).first()
                # Add owner to this book instance
                book.ownings.add(chosen_owning)

    except BookInstance.DoesNotExist:
        book_id = -1
    return book_id

class CodeExists(APIView):
    """
    Takes access code and checks if it corresponds to a book instance.
    """
    permission_classes = ()
    authentication_classes = ()

    def post(self, request):
        """
        Return a list of all users.
        """
        book_id = get_book(request.data["accessCode"]) # retrieve the book instance id using accessCode
        if book_id == -1:
            return Response(data={'valid': False})  # return false as code is invalid
        else:
            return Response(data={'valid': True, 'book_id': book_id})  # Otherwise, return id

class BookHoldingWriteViewSet(viewsets.ModelViewSet):
    queryset = BookHolding.objects.all()
    serializer_class = BookHoldingWriteSerializer

class PreferencesViewSet(APIView):
    """
    Retrieve, update or delete a snippet instance.
    """

    def get(self, request):
        try:
            user = None
            if request and hasattr(request, "user"):
                user = request.user
        except Exception:
            raise ParseError(detail="Authentication error" + request.context, code=400)
        else:
            try:
                if user.groups.filter(name="Anonymous").count():
                    anonymous = True
                else:
                    anonymous = False

                if user.groups.filter(name="MailUpdates").count():
                    mail_updates = True
                else:
                    mail_updates = False

                if user.groups.filter(name="Activated").count():
                    activated = True
                else:
                    activated = False
            except Exception:
                raise ParseError(detail="Groups error", code=400)
            else:
                try:
                    serializer = PreferencesSerializer(
                    data={'anonymous': anonymous, 'mail_updates': mail_updates, 'activated': activated})
                    serializer.is_valid()
                except Exception:
                    raise ParseError(detail="Serializer error", code=400)
                return Response(serializer.data)

    def patch(self, request):
        # add user to user group Anonymous if specified
        try:
            user = None
            if request and hasattr(request, "user"):
                user = request.user
        except Exception:
            raise ParseError(detail="Authentication error" + request.context, code=400)
        else:
            serializer = PreferencesSerializer(
                data=request.data)

            if not serializer.is_valid():
                return Response(serializer.errors, 400)

            serializer.save(user)

            return Response(serializer.data)

# OVERWRITE DEFAULT REST_AUTH USER DETAILS VIEW
from rest_framework.generics import RetrieveUpdateAPIView
class UserDetailsWithEmailView(RetrieveUpdateAPIView):
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH methods.
    Default accepted fields: username, first_name, last_name
    Default display fields: pk, username, email, first_name, last_name
    Read-only fields: pk
    Returns UserModel fields.
    """
    serializer_class = UserDetailsSerializerWithEmail
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get_queryset(self):
        """
        Adding this method since it is sometimes called when using
        django-rest-swagger
        https://github.com/Tivix/django-rest-auth/issues/275
        """
        return get_user_model().objects.none()
