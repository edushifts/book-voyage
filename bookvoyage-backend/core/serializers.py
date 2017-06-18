from rest_framework import serializers
from core.models import BookInstance
from django.contrib.auth.models import User

class BookInstanceSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    book = serializers.ReadOnlyField(source='book.title')
    batch = serializers.ReadOnlyField(source='batch.event')
    current_holder = serializers.ReadOnlyField(source='holder.username')

    class Meta:
        model = BookInstance
        fields = ('id', 'arrived','batch','book','current_holder','owner')
                  
# class UserSerializer(serializers.HyperlinkedModelSerializer):
#     snippets = serializers.HyperlinkedRelatedField(queryset=Snippet.objects.all(), view_name='snippet-detail', many=True)

#     class Meta:
#         model = User
# 		fields = ('url', 'username', 'snippets')