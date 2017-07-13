from django.shortcuts import render

from .models import BookInstance, BookBatch, BookHolding
from core.serializers import BookInstanceSerializer, BookBatchSerializer, BookHoldingSerializer, BookHoldingWriteSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import viewsets

def index(request):
    """
    View function for home page of site.
    """
    return render(
        request,
        'index.html',
    )

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
    """
    try:
        book = BookInstance.objects.get(book_code=code).id
    except BookInstance.DoesNotExist:
        book = -1
    return book

class CodeExists(APIView):
    """
    takes access code and checks if it corresponds to a book instance
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
