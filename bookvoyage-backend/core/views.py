from django.shortcuts import render

from .models import BookInstance, BookHolding, BookCode, BookBatch
from core.serializers import BookInstanceSerializer, BookBatchSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import viewsets, permissions

# Create your views here.

def index(request):
    """
    View function for home page of site.
    """
    #getBook1 = getBook("DJK831LOK")
    #getBook2 = getBook("741KLO012")
    #getPrevHolderCount1 = getPrevHolderCount(1)
    #getPrevHolderCount2 = getPrevHolderCount(2)
    #getPrevHolderCount10 = getPrevHolderCount(10)

    # Render the test HTML template index.html
    return render(
        request,
        'index.html',
        #context={'getBook1':getBook1,'getBook2':getBook2,'getPrevHolderCount1': getPrevHolderCount1,
         #'getPrevHolderCount2':getPrevHolderCount2,'getPrevHolderCount10': getPrevHolderCount10}
    )

def login(request):
    return render(request,'login.html')

def footer(request):
    return render(request,'footer.html')

def getBook(code):
    """
    Takes a secret BookInstance access code and converts it to the public BookInstance id.
    If the given code has no corresponding book, it returns -1.
    """
    try:
        book = BookInstance.objects.get(access_code=code).id
    except BookInstance.DoesNotExist:
        book = -1
    return book

class BookInstanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = ()
    authentication_classes = ()

    queryset = BookInstance.objects.all()
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

class CodeExists(APIView):
    """
    View to list all users in the system.

    * Requires token authentication.
    * Only admin users are able to access this view.
    """
    permission_classes = ()
    authentication_classes = ()

    def post(self, request):
        """
        Return a list of all users.
        """
        try:
            code = BookCode.objects.get(book_code=request.data["accessCode"])  # retrieve the user using accessCode
        except BookCode.DoesNotExist:
            return Response(data={'valid': False})  # return false as user does not exist
        else:
            return Response(data={'valid': True})  # Otherwise, return True