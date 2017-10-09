# Import utilities
from django.utils import timezone
import logging

# Import rest_framework classes
from rest_framework import serializers
from rest_framework.exceptions import ParseError

# Import models
from django.contrib.auth.models import Group
from core.models import BookInstance, BookHolding, BookBatch, BookOwning, UserProfile
from django.contrib.auth.models import User
from rest_auth.serializers import UserModel

# Import mail senders
from core import mail

# Import environment variables
from bookvoyage.settings import MULTIPLE_REGISTRATIONS_ALLOWED


class UserGenSerializer(serializers.ModelSerializer):
    """
    Returns queried users' first and last names.
    """
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    def get_first_name(self, user):
        if user.groups.filter(name='Anonymous').exists():
            return "Anonymous"
        else:
            return user.first_name

    def get_last_name(self, user):
        if user.groups.filter(name='Anonymous').exists():
            return ""
        else:
            return user.last_name

    def get_url(self, user):
        if user.groups.filter(name='Anonymous').exists():
            return ""
        else:
            if UserProfile.objects.filter(user=user).count():
                return UserProfile.objects.get(user=user).url
            else:
                return ""

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'url')


class BookInstanceMinSerializer(serializers.ModelSerializer):
    """
    Returns queried book instances' details only. The full book instance serializer is below.
    """

    class Meta:
        model = BookInstance
        fields = ('id', 'arrived')


class BookBatchSerializer(serializers.HyperlinkedModelSerializer):
    """
    Returns queried book batches' details.
    """
    location = serializers.SerializerMethodField()

    def get_location(self, obj):
        return obj.location,  # As long as the fields are auto serializable to JSON

    class Meta:
        model = BookBatch
        fields = ('event', 'country', 'location', 'date')


class BookOwningSerializer(serializers.ModelSerializer):
    """
    Returns queried book ownings' details.
    """
    owner = UserGenSerializer(many=False, read_only=True)
    location = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    def get_location(self, obj):
        return obj.location,

    def get_time(self, obj):
        return obj.time.strftime("%Y-%m-%d"),

    class Meta:
        model = BookOwning
        fields = ('owner', 'time', 'message', 'location')


class OwnershipSerializer(serializers.ModelSerializer):
    """
    Returns queried book holdings' id and its related book instance.
    """
    book_instance = BookInstanceMinSerializer()

    class Meta:
        model = BookOwning
        fields = ('id', 'book_instance',)


class BookHoldingSerializer(serializers.HyperlinkedModelSerializer):
    """
    Returns queried book holdings' details.
    """
    holder = UserGenSerializer(many=False, read_only=True)
    location = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    def get_location(self, obj):
        return obj.location,  # As long as the fields are auto serializable to JSON

    def get_time(self, obj):
        return obj.time.strftime("%Y-%m-%d"),  # As long as the fields are auto serializable to JSON

    class Meta:
        model = BookHolding
        fields = ('time', 'message', 'location', 'holder')


class BookHoldingWriteSerializer(serializers.ModelSerializer):
    """
    Allows writing new book holding objects.
    Validates permissions based on provided book code.
    """
    book_code = serializers.CharField(read_only=False, required=True, write_only=True)
    time = serializers.DateTimeField(required=False, read_only=True)
    holder = serializers.PrimaryKeyRelatedField(required=False, read_only=True)
    location = serializers.JSONField(required=True)

    def create(self, validated_data):
        logger = logging.getLogger("UserHoldingWrite")

        # Define boolean: did the current holder already register this book earlier?
        already_registered_book = False

        try:  # If book code does not correspond with book holding id, refuse post
            given_code = validated_data['book_code'].upper()
            book = BookInstance.objects.get(book_code=given_code)
            book.id  # trigger exception if it does not exist

            # At this stage, the book code has been validated and can be removed from the object.
            del validated_data["book_code"]
        except BookInstance.DoesNotExist:
            raise ParseError(detail="Book code is faulty", code=401)
        else:
            # Get currently logged-in user and designate as holder
            user = None
            request = self.context.get("request")
            if request and hasattr(request, "user"):  # If user exists
                user = request.user
                # Add check on whether holder already registered this book instance before.

                try:
                    book.holdings.filter(holder=user)[0]
                except (User.DoesNotExist, IndexError):
                    logger.info("User initiated a book: " + user.email)
                    pass
                else:
                    already_registered_book = True
                    logger.info("User performed multiple registrations: " + user.email)
                    if not MULTIPLE_REGISTRATIONS_ALLOWED:
                        raise ParseError(detail="You have already registered this book.", code=403)
            else:
                raise ParseError(detail="User name error", code=400)

            validated_data['time'] = timezone.now()
            validated_data['holder'] = user

            # Query previous holders before the new holder has been added. List forces evaluation.
            holders = list(User.objects.filter(groups__name='MailUpdates')
                           .filter(holdings__book_instance=book).distinct('id'))

            # Save new holding to the database
            BookHolding(**validated_data).save()

            # After success, send emails to parties involved
            # 1 | Send email to thank the new holder; only if not already thanked for this book instance
            if not already_registered_book:
                mail.send_holder_welcome(user, book)

            # 2 | Send email to all holders and owners related to the book entry
            mail.send_book_update_mass(holders, book)

            # 3 | Send email to last known owner
            # # TODO: fix this query
            last_owner = book.ownings.last().owner
            if last_owner.groups.filter(name='MailUpdates').exists():
                # send an email
                mail.send_book_update(last_owner, book)

            # Return api response
            return BookHolding(**validated_data)

    class Meta:
        model = BookHolding
        fields = '__all__'


class Preferences(object):
    """
    Simple class used by PreferencesSerializer
    """
    def __init__(self, **kwargs):
        if kwargs['anonymous']:
            self.anonymous = kwargs['anonymous']
        if kwargs['mail_updates']:
            self.mail_updates = kwargs['mail_updates']
        if kwargs['activated']:
            self.activated = kwargs['activated']
        if kwargs['url']:
            self.url = kwargs['url']


class PreferencesSerializer(serializers.Serializer):
    """
    Displays and allows modification of user references
    """
    anonymous = serializers.BooleanField(read_only=False, required=False)
    mail_updates = serializers.BooleanField(read_only=False, required=False)
    activated = serializers.BooleanField(read_only=False, required=False)
    url = serializers.URLField(read_only=False, required=False, allow_blank=True)

    def create(self, validated_data):
        return Preferences(**validated_data)

    def save(self, user):
        # Add user to user group Anonymous if specified
        try:
            if 'anonymous' in self.data and self.data['anonymous']:
                g_a = Group.objects.get(name='Anonymous')
                g_a.user_set.add(user)
            else:
                g_a = Group.objects.get(name='Anonymous')
                g_a.user_set.remove(user)
        except Exception:
            raise ParseError(detail="Problem with anonymous field", code=400)

        # Add user to user group MailUpdates if specified
        try:
            if 'mail_updates' in self.data and self.data['mail_updates']:
                g_m = Group.objects.get(name='MailUpdates')
                g_m.user_set.add(user)
            else:
                g_a = Group.objects.get(name='MailUpdates')
                g_a.user_set.remove(user)
        except Exception:
            raise ParseError(detail="Problem with mail updates field", code=400)

        # Add user to user group DataAgreement if specified
        if 'activated' in self.data and self.data['activated']:
            try:
                g_m = Group.objects.get(name='Activated')
                g_m.user_set.add(user)
            except Exception:
                raise ParseError(detail="Problem with activated field", code=400)
        elif 'activated' in self.data:
            # It is not possible to remove oneself from the agreement through the API.
            raise ParseError(detail="Your account needs to be activated to use it. "
                                    "Please contact the platform owners if you would "
                                    "like your account removed.", code=400)

        # Add url to user profile if specified
        try:
            if 'url' in self.data:  # If user profile exists
                if UserProfile.objects.filter(user=user).count():
                    instance = UserProfile.objects.get(user=user)
                    instance.url = self.data['url']
                    instance.save()
                else:  # If user profile does not exist yet
                    url = self.data['url']
                    instance = UserProfileSerializer(data={'user': user.pk, 'url': url})
                    instance.is_valid()
                    instance.save()
        except Exception:
            raise ParseError(detail="Problem with adding url", code=400)


class UserProfileSerializer(serializers.ModelSerializer):
    url = serializers.URLField(read_only=False, required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = ('user', 'url')


class BookInstanceSerializer(serializers.HyperlinkedModelSerializer):
    """
    Returns queried book instances' details and its attached holdings and ownings
    """
    holdings = BookHoldingSerializer(many=True, read_only=True)
    batch = BookBatchSerializer(many=False, read_only=True)
    ownings = BookOwningSerializer(many=True, read_only=True)

    class Meta:
        model = BookInstance
        fields = ('id', 'arrived', 'batch', 'ownings', 'holdings')


class UserEmail(serializers.Serializer):
    email = serializers.CharField(read_only=False, required=True)


# OVERWRITE DEFAULT REST_AUTH USER DETAILS SERIALIZER
class UserDetailsSerializerWithEmail(serializers.ModelSerializer):
    """
    User model w/o password, but with email.
    """
    class Meta:
        model = UserModel
        fields = ('pk', 'username', 'email', 'first_name', 'last_name')
        # read_only_fields = ('email', )
