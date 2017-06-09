from django.shortcuts import render

# Create your views here.

def index(request):
    """
    View function for home page of site.
    """

    # Render the test HTML template index.html
    return render(
        request,
        'index.html',
    )