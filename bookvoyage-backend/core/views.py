import random

from django.utils.encoding import force_bytes, force_text
from django.utils.http import int_to_base36
from rest_auth.app_settings import create_token
from rest_auth.utils import jwt_encode

from bookvoyage import settings
from allauth.account.forms import UserTokenForm
from allauth.account.utils import user_pk_to_url_str
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework.exceptions import ParseError
from rest_framework.permissions import IsAuthenticated

from config import HOST_FRONTEND, PASSWORD_RESET_LINK, SITE_NAME, DEFAULT_FROM_EMAIL, DEBUG_EMAIL
from .models import BookInstance, BookBatch, BookHolding, BookOwning
from core.serializers import BookInstanceSerializer, BookBatchSerializer, BookHoldingSerializer, \
    BookHoldingWriteSerializer, PreferencesSerializer, Preferences, UserDetailsSerializerWithEmail, OwnerGenSerializer, \
    OwnershipSerializer
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

class BookOwningViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    Contains a user's book ownings
    """
    serializer_class = OwnershipSerializer
    def get_queryset(self):
        request = self.request
        if request and hasattr(request, "user"):
            user = request.user
            return BookOwning.objects.filter(owner=user)

class BookHoldingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    Contains a user's previous book holdings
    """
    serializer_class = OwnershipSerializer
    def get_queryset(self):
        request = self.request
        if request and hasattr(request, "user"):
            user = request.user
            return BookHolding.objects.filter(holder=user)

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

        # user = User.objects.get(email__iexact=DEBUG_EMAIL)
        # send_owner_invitation(user)
        # import logging
        # logger = logging.getLogger("regular")

        if not book.ownings.exists():
            # Find ownings without a book instance attached
            owner_query = BookOwning.objects.filter(book_instance__isnull=True)
            if owner_query.count() > 0: # if such ownings exist
                # First find owners who paid
                owner_count = owner_query.filter(secondary=False).count()
                if owner_count > 0:
                    if owner_count > 1: random_id = random.randint(0, owner_count - 1)
                    else: random_id = 0
                    chosen_owning = owner_query.filter(secondary=False)[random_id]
                    # Add owner to this book instance
                    book.ownings.add(chosen_owning)

                    # Send e-mail to user
                    owner = chosen_owning.owner
                    send_owner_invitation(owner)
                else:
                    # Then destinations we picked
                    owner_count = owner_query.filter(secondary=True).count()
                    if owner_count > 0:
                        if owner_count > 1: random_id = random.randint(0, owner_count - 1)
                        else: random_id = 0
                        chosen_owning = owner_query.filter(secondary=True)[random_id]
                        # Add owner to this book instance
                        book.ownings.add(chosen_owning)

            # Alternative: picks first entry in list rather than a random one
            #
            # if owner_query.filter(secondary=False).exists():
            #     chosen_owning = owner_query.filter(secondary=False).first()
            #     # Add owner to this book instance
            #     book.ownings.add(chosen_owning)
            # elif owner_query.filter(secondary=True).exists():
            #     chosen_owning = owner_query.filter(secondary=True).first()
            #     # Add owner to this book instance
            #     book.ownings.add(chosen_owning)
            #
            #     owner = chosen_owning.owner
            #     send_owner_invitation(owner)

    except BookInstance.DoesNotExist:
        book_id = -1
    return book_id

def send_owner_invitation(user):
    """
    Adapted from https://github.com/pennersr/django-allauth/blob/master/allauth/account/forms.py
    :param user:
    :return:
    """

    # Retrieve user email address
    user_email = user.email

    token_generator = default_token_generator

    temp_key = token_generator.make_token(user)

    from django.utils.http import urlsafe_base64_encode
    # url = HOST_FRONTEND + PASSWORD_RESET_LINK + user_pk_to_url_str(user) + "-" + temp_key
    url = HOST_FRONTEND + PASSWORD_RESET_LINK + force_text(urlsafe_base64_encode((force_bytes(user.id)))) + "-" + temp_key

    # logger.error(url) # DEBUG

    context = {"current_site": SITE_NAME,
               "user": user,
               "password_reset_url": url}



    # if app_settings.AUTHENTICATION_METHOD \
    #         != AuthenticationMethod.EMAIL:
    #     context['username'] = user_username(user)
    send_mail(
        'Subject here',
        'Here is the message with the link: ' + url,
        DEFAULT_FROM_EMAIL,
        [user_email],
        fail_silently=False,
    )

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
