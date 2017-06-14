from django.shortcuts import render
from .models import BookInstance, BookHolding
from core.serializers import BookInstanceSerializer

from rest_framework import viewsets

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

def getPrevHolderCount(bookInstanceId):
    """
    Takes a BookInstance id and returns the count of previous book holders.
    If the BookInstance does not exists, it returns -1.
    """
    try:
        # first check if the given book instance exists
        BookInstance.objects.get(id=bookInstanceId)
        prevHolders = BookHolding.objects.filter(bookinstance__id=bookInstanceId).count()
    except BookInstance.DoesNotExist:
        prevHolders = -1
    return prevHolders

class BookInstanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = BookInstance.objects.all()
    serializer_class = BookInstanceSerializer