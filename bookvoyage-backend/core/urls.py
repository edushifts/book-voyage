from django.conf.urls import url, include
from core import views
from rest_framework.routers import DefaultRouter
from django.views.generic.base import TemplateView
from rest_framework_jwt.views import refresh_jwt_token

# Create a router and register our public (GET) viewsets with it.
router = DefaultRouter()
router.register(r'bookInstances', views.BookInstanceViewSet)
router.register(r'bookInstancesActive', views.BookInstanceViewSetMin)
router.register(r'bookBatches', views.BookBatchViewSet)

# These (POST) viewsets are personalised for the user currently logged in
router.register(r'myBookOwnings', views.BookOwningViewSet, base_name="MyBookOwning")
router.register(r'myBookHoldings', views.BookHoldingViewSet, base_name="MyBookHolding")

# This (POST) viewset is used to write a new book holding to the database
router.register(r'bookHoldings', views.BookHoldingWriteViewSet)

urlpatterns = [
    # Import previously defined router
    url(r'^api/', include(router.urls)),

    # This (POST) viewset is used to verify whether a book code is valid and triggers user assignments (see wiki)
    url(r'^api/codeExists', views.CodeExistsViewSet.as_view()),

    # Overwrite rest-auth user viewset, add custom preferences viewset, then import libraries
    url(r'^api-auth/user/', views.UserDetailsWithEmailView.as_view()),
    url(r'^api-auth/preferences', views.PreferencesViewSet.as_view()),
    url(r'^api-auth/', include('rest_auth.urls')),
    url(r'^api-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^api-auth/refresh/', refresh_jwt_token)
]

# Catch-all for Angular app
urlpatterns += [
    url(r'^.*', TemplateView.as_view(template_name="index.html"), name="home")
]
