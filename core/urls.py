from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login/$', views.login, name='login'),
]

# Use GeoJSON api
from djgeojson.views import GeoJSONLayerView
from .models import BookHolding

# GeoJSON book locations hook. Returns object with all BookLocation elements.
urlpatterns += [
    url(r'^api/bookLocs.geojson$', GeoJSONLayerView.as_view(model=BookHolding, geometry_field='location', properties=('book_instance','holder','time','message',)), name='bookLocs',),
]

from django.conf.urls import url, include
from core import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'bookInstances', views.BookInstanceViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns += [
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_auth.urls')),
    url(r'^api-auth/registration/', include('rest_auth.registration.urls')),
]