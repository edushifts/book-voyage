import json
from rest_framework import serializers
from core.models import BookInstance, BookHolding, BookBatch, BookOwning
from django.contrib.auth.models import User

class UserGenSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name')

class OwnerGenSerializer(serializers.ModelSerializer):
    owner = UserGenSerializer(many=False, read_only=True)

    location = serializers.SerializerMethodField()

    def get_location(self, obj):
        return obj.location,  # As long as the fields are auto serializable to JSON

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

    def get_location(self, obj):
        return obj.location,  # As long as the fields are auto serializable to JSON

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
        fields = ('arrived', 'batch', 'ownings', 'holdings') # 'batch','book','holdings','owner'



                  
# class UserSerializer(serializers.HyperlinkedModelSerializer):
#     snippets = serializers.HyperlinkedRelatedField(queryset=Snippet.objects.all(), view_name='snippet-detail', many=True)
#
#     class Meta:
#         model = User
# 		fields = ('url', 'username', 'snippets')