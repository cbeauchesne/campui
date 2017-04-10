from django.conf.urls import include, url
from django.contrib import admin
from api.urls import urlpatterns as api_urls
from .settings import BASE_DIR
from django.views import static
import os

admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls)),
    url(r'^$', static.serve, kwargs={'path': 'index.html', 'document_root' : os.path.join(BASE_DIR, 'static')}),
]
