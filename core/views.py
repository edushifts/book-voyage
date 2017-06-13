from django.shortcuts import render
from .models import BookInstance
# Create your views here.

def index(request):
    """
    View function for home page of site.
    """
    getBook1 = getBook("DJK831LOK")
    getBook2 = getBook("741KLO012")

    # Render the test HTML template index.html
    return render(
        request,
        'index.html',
        context={'getBook1':getBook1,'getBook2':getBook2,}
    )

def getBook(code):
    """
    Takes a secret BookInstance access code and converts it to the public BookInstance id.
    If the given code has no corresponding book, it returns 0.
    """
    try:
        book = BookInstance.objects.get(access_code=code).id
    except BookInstance.DoesNotExist:
        book = -1
    return book

