# Import utilities
import random

# Import rest_framework classes
from rest_framework.exceptions import ParseError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.generics import RetrieveUpdateAPIView

# Import models
from .models import BookInstance, BookBatch, BookHolding, BookOwning
from django.contrib.auth import get_user_model

# Import serializers
from core.serializers import BookInstanceSerializer, BookBatchSerializer, \
    BookHoldingWriteSerializer, PreferencesSerializer, UserDetailsSerializerWithEmail, \
    OwnershipSerializer, BookOwningSerializer

# Import mail senders
from core import mail


def get_book(code):
    """
    Takes a secret access code and converts it to the book instance id related to it.
    If the given code has no corresponding book, it returns -1.

    If the book instance exists, it will check if an owner is already assigned to it.
    If not, it will assign a currently book-less owner to it and send this user an e-mail.
    """
    try:
        code = code.upper()
        book = BookInstance.objects.get(book_code=code)
        book_id = book.id

        # Check if this book has an owner already. If not, try to assign one.
        if not book.ownings.exists():
            # Find ownings without a book instance attached
            owner_query = BookOwning.objects.filter(book_instance__isnull=True)
            if owner_query.count() > 0:  # if such ownings exist
                # Try to find owners who paid (primary ownings)
                owner_count = owner_query.filter(secondary=False).count()
                if owner_count > 0:
                    # Take a random unassigned owning
                    if owner_count > 1:
                        random_id = random.randint(0, owner_count - 1)
                    else:
                        random_id = 0
                    chosen_owning = owner_query.filter(secondary=False)[random_id]

                    # Assign book instance to the owning
                    book.ownings.add(chosen_owning)

                    # Send e-mail to user with an invitation
                    # TODO: check whether this user was already mailed before (multi-book owners)
                    owner = chosen_owning.owner
                    mail.send_owner_invitation(owner)
                else:
                    # Then try to find handpicked destinations (secondary ownings)
                    owner_count = owner_query.filter(secondary=True).count()
                    if owner_count > 0:
                        if owner_count > 1:
                            random_id = random.randint(0, owner_count - 1)
                        else:
                            random_id = 0
                        chosen_owning = owner_query.filter(secondary=True)[random_id]

                        # Assign book instance to the owning
                        book.ownings.add(chosen_owning)

    except BookInstance.DoesNotExist:
        book_id = -1
    return book_id


class BookInstanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Contains all book instances.
    Provides `list` and `detail` views.
    Read-only and public.
    """
    permission_classes = ()
    authentication_classes = ()

    queryset = BookInstance.objects.all()
    serializer_class = BookInstanceSerializer


class BookInstanceViewSetMin(viewsets.ReadOnlyModelViewSet):
    """
    Contains only book instances with at least one owning.
    Used to save resources and loading time compared to regular book instance viewset.
    Provides `list` and `detail` views.
    Read-only and public.
    """
    permission_classes = ()
    authentication_classes = ()

    queryset = BookInstance.objects.exclude(ownings__isnull=True)
    serializer_class = BookInstanceSerializer


class UnassignedBookOwningsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Contains all currently unassigned book ownings.
    Provides `list` and `detail` views.
    Read-only and public.
    """
    permission_classes = ()
    authentication_classes = ()

    serializer_class = BookOwningSerializer
    queryset = BookOwning.objects.exclude(book_instance_id__isnull=False)


class MyBookOwningsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Contains an authorised user's own book ownings.
    Provides `list` and `detail` views.
    Read-only and private.
    """
    serializer_class = OwnershipSerializer

    def get_queryset(self):
        request = self.request
        if request and hasattr(request, "user"):
            user = request.user
            return BookOwning.objects.filter(owner=user)


class MyBookHoldingsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Contains an authorised user's own book ownings.
    Provides `list` and `detail` views.
    Read-only and private.
    """
    serializer_class = OwnershipSerializer

    def get_queryset(self):
        request = self.request
        if request and hasattr(request, "user"):
            user = request.user
            return BookHolding.objects.filter(holder=user)


class BookBatchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Contains all book batches.
    Provides `list` and `detail` views.
    Read-only and public.
    """
    permission_classes = ()
    authentication_classes = ()

    queryset = BookBatch.objects.all()
    serializer_class = BookBatchSerializer


class CodeExistsViewSet(APIView):
    """
    Takes access code and checks if it corresponds to a book instance. Returns true with an id or false.
    Potentially causes a mail to be sent to an unassigned user (see get_book function).
    Requires input which potentially impacts the database, and is public.
    Write-only and public.
    """
    permission_classes = ()
    authentication_classes = ()

    def post(self, request):
        book_id = get_book(request.data["accessCode"])  # retrieve the book instance id using accessCode
        if book_id == -1:
            return Response(data={'valid': False})  # return false as code is invalid
        else:
            return Response(data={'valid': True, 'book_id': book_id})  # Otherwise, return id


class BookHoldingWriteViewSet(viewsets.ModelViewSet):
    """
    Takes book_code, location (in lat/lng), message, and book_instance id.
    Checks if book_instance id and book_code correspond. If not, refuse.
    Adds a book holding entry to the database and causes update mails
        to be sent to all previous holders and the last owner.
    Requires input which potentially impacts the database, and is public.
    """
    queryset = BookHolding.objects.all()
    serializer_class = BookHoldingWriteSerializer


class PreferencesViewSet(APIView):
    """
    Returns and allows writing to the user preferences model.
    Read-and-write, and private.
    """

    def get(self, request):
        # First, retrieve user currently logged in.
        try:
            user = None
            if request and hasattr(request, "user"):
                user = request.user
        except Exception:
            raise ParseError(detail="Authentication error" + request.context, code=400)
        else:
            try:
                # Then return group membership statuses
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
                # Then return these statuses
                try:
                    serializer = PreferencesSerializer(
                        data={'anonymous': anonymous, 'mail_updates': mail_updates, 'activated': activated})
                    serializer.is_valid()
                except Exception:
                    raise ParseError(detail="Serializer error", code=400)
                return Response(serializer.data)

    def patch(self, request):
        """
        Add/remove user to specified groups.
        """
        # First, retrieve user currently logged in.
        try:
            user = None
            if request and hasattr(request, "user"):
                user = request.user
        except Exception:
            raise ParseError(detail="Authentication error" + request.context, code=400)
        else:
            # Write preferences to database
            serializer = PreferencesSerializer(
                data=request.data)

            if not serializer.is_valid():
                return Response(serializer.errors, 400)

            serializer.save(user)
            return Response(serializer.data)


# OVERWRITE DEFAULT REST_AUTH USER DETAILS VIEW
# Addition is ability to write to e-mail
# Currently makes e-mail verification incompatible.
# TODO: enforce e-mail verification if this option is turned on
class UserDetailsWithEmailView(RetrieveUpdateAPIView):
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH methods.
    Default accepted fields: username, email, first_name, last_name
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
