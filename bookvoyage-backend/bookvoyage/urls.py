from django.conf.urls import url
from django.contrib import admin
from django.conf.urls import include

# See the core.urls file for all app-related urls
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'', include('core.urls'))
]
