from rest_framework import serializers
from rest_framework.exceptions import ParseError
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
    # owner = serializers.ReadOnlyField(source='owner.username')
    # book = serializers.ReadOnlyField(source='book.title')
    # batch = serializers.ReadOnlyField(source='batch.event')

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
            book = BookInstance.objects.get(book_code=validated_data['book_code']).id
        except BookInstance.DoesNotExist:
            raise ParseError(detail="Book code is faulty", code=400)
        else:
            try:
                user = None
                request = self.context.get("request")
                if request and hasattr(request, "user"):
                    user = request.user
            except BookInstance.DoesNotExist:
                raise ParseError(detail="User name error", code=400)
            else:
                validated_data['time'] = datetime.datetime.now()
                validated_data['holder'] = user
                del validated_data["book_code"]
                BookHolding(**validated_data).save()
                return BookHolding(**validated_data)

    class Meta:
        model = BookHolding
        fields = '__all__'

# class UserSerializer(serializers.HyperlinkedModelSerializer):
#     snippets = serializers.HyperlinkedRelatedField(queryset=Snippet.objects.all(), view_name='snippet-detail', many=True)
#
#     class Meta:
#         model = User
# 		fields = ('url', 'username', 'snippets')