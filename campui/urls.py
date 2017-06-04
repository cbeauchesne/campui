from django.conf.urls import include, url
from django.contrib import admin
from .settings import BASE_DIR
from django.views import static
from campui import admin_custom
from api.urls import urlpatterns as api_urls
from analytics.urls import urlpatterns as analytics_urls
from wapi.urls import urlpatterns as wiki_urls


admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls + wiki_urls)),
    url(r'^analytics/', include(analytics_urls)),

]

angular_view = {"view": static.serve,
                "kwargs": {'path': 'index.html', 'document_root': BASE_DIR}}

urlpatterns += [url(r'^', **angular_view)]

