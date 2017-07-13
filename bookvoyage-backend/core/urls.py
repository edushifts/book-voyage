from django.conf.urls import url, include
from core import views
from rest_framework.routers import DefaultRouter
from django.views.generic.base import TemplateView

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'bookInstances', views.BookInstanceViewSet)
router.register(r'bookBatches', views.BookBatchViewSet)
router.register(r'bookInstancesActive', views.BookInstanceViewSetMin)
router.register(r'bookHoldings', views.BookHoldingWriteViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    #url(r'^$', views.index, name='index'),
    #url(r'^login/$', views.login, name='login'),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_auth.urls')),
    url(r'^api-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^api/codeExists', views.CodeExists.as_view())
]


# Use GeoJSON api
# from djgeojson.views import GeoJSONLayerView
# from .models import BookHolding

# GeoJSON book locations hook. Returns object with all BookLocation elements.
# Deprecated, now included in book registration
# urlpatterns += [
#     url(r'^api/bookLocs.geojson$',
#         GeoJSONLayerView.as_view(
#             model=BookHolding,
#             geometry_field='location',
#             properties=('book_instance','holder','time','message',
#                         )
#         ),
#         name='bookLocs',),
# ]

# catch-all for Angular app
urlpatterns += [
	url(r'^.*', TemplateView.as_view(template_name="ang_home.html"), name="home")
]