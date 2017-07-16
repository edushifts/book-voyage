from rest_framework import serializers
from rest_framework.exceptions import ParseError
from django.contrib.auth.models import Group
import datetime

from core.models import BookInstance, BookHolding, BookBatch, BookOwning
from django.contrib.auth.models import User

class UserGenSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

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

    class Meta:
        model = User
        fields = ('first_name', 'last_name')

class OwnerGenSerializer(serializers.ModelSerializer):
    owner = UserGenSerializer(many=False, read_only=True)
    location = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    def get_location(self, obj):
        return obj.location,  # As long as the fields are auto serializable to JSON

    def get_time(self, obj):
        return obj.time.strftime("%Y-%m-%d"),  # As long as the fields are auto serializable to JSON

    class Meta:
        model = BookOwning
        fields = ('owner', 'time', 'message', 'location')

class BookBatchSerializer(serializers.HyperlinkedModelSerializer):
    location = serializers.SerializerMethodField()

    def get_location(self, obj):
        return obj.location,  # As long as the fields are auto serializable to JSON

    class Meta:
        model = BookBatch
        fields = ('event', 'country', 'location', 'date')

class BookHoldingSerializer(serializers.HyperlinkedModelSerializer):
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

class BookInstanceSerializer(serializers.HyperlinkedModelSerializer):
    holdings = BookHoldingSerializer(many=True, read_only=True)
    batch = BookBatchSerializer(many=False, read_only=True)
    ownings = OwnerGenSerializer(many=True, read_only=True)

    class Meta:
        model = BookInstance
        fields = ('id', 'arrived', 'batch', 'ownings', 'holdings') # 'batch','book','holdings','owner'

class BookHoldingWriteSerializer(serializers.ModelSerializer):
    book_code = serializers.CharField(read_only=False, required=True, write_only=True)
    time = serializers.DateTimeField(required=False, read_only=True)
    holder = serializers.PrimaryKeyRelatedField(required=False, read_only=True)
    location = serializers.JSONField(required=True)

    def create(self, validated_data):
        # if book code does not correspond with book holding id, refuse post
        try:
            given_code = validated_data['book_code'].upper()
            book = BookInstance.objects.get(book_code=given_code).id
            del validated_data["book_code"]
        except BookInstance.DoesNotExist:
            raise ParseError(detail="Book code is faulty", code=400)
        else:
            # get currently logged-in user and designate as holder
            try:
                user = None
                request = self.context.get("request")
                if request and hasattr(request, "user"):
                    user = request.user
            except Exception:
                raise ParseError(detail="User name error", code=400)
            else:
                # add current time
                validated_data['time'] = datetime.datetime.now()
                validated_data['holder'] = user

                BookHolding(**validated_data).save()
                return BookHolding(**validated_data)

    class Meta:
        model = BookHolding
        fields = '__all__'

class Preferences(object):
    def __init__(self, **kwargs):
        if kwargs['anonymous']:
            self.anonymous = kwargs['anonymous']
        if kwargs['mail_updates']:
            self.mail_updates = kwargs['mail_updates']
        if kwargs['activated']:
            self.activated = kwargs['activated']

class PreferencesSerializer(serializers.Serializer):
    anonymous = serializers.BooleanField(read_only=False, required=False)
    mail_updates = serializers.BooleanField(read_only=False, required=False)
    activated = serializers.BooleanField(read_only=False, required=False)

    def create(self, validated_data):
        return Preferences(**validated_data)

    # def update(self, instance, validated_data):
    #     instance.anonymous = validated_data.get('anonymous', instance.anonymous)
    #     instance.mail_updates = validated_data.get('mail_updates', instance.mail_updates)
    #     return instance

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