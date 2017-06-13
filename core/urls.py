from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
]

# Use GeoJSON api
from djgeojson.views import GeoJSONLayerView
from .models import BookOwnerLoc

# GeoJSON book locations hook. Returns object with all BookLocation elements.
urlpatterns += [
	url(r'^api/bookLocs.geojson$', GeoJSONLayerView.as_view(model=BookOwnerLoc, properties=('name','book_holding','time',)), name='bookLocs'),
]