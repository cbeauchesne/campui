from django.conf.urls import include, url
from django.contrib import admin
from api.urls import urlpatterns as api_urls
from .settings import BASE_DIR
from django.views import static
from campui import admin_custom
from analytics.urls import urlpatterns as analytics_urls


admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls)),
    url(r'^analytics/', include(analytics_urls)),

]

angular_view = {"view": static.serve,
                "kwargs": {'path': 'index.html', 'document_root': BASE_DIR}}

urlpatterns += [url(r'^', **angular_view)]
