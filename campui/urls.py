from django.conf.urls import include, url
from django.contrib import admin
from api.urls import urlpatterns as api_urls

admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls)),
]
