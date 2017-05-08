from django.conf.urls import include, url
from django.contrib import admin
from api.urls import urlpatterns as api_urls
from .settings import BASE_DIR
from django.views import static
from campui import admin_custom


admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls)),
]

angular_view = {"view": static.serve,
                "kwargs": {'path': 'index.html', 'document_root': BASE_DIR}}

urlpatterns += [url(r'^$', **angular_view),
                url(r'^credits$', **angular_view),
                url(r'^faq$', **angular_view),
                url(r'^me$', **angular_view),
                url(r'^stories', **angular_view),
                url(r'^login$', **angular_view),
                url(r'^register$', **angular_view),
                url(r'^search', **angular_view),
                url(r'^markdown$', **angular_view),
                url(r'^outing-images', **angular_view),
                ]

for item in ["user", "outing", "route", "area", "waypoint", "article", "xreport"]:
    urlpatterns += [
        url(r'^{}/'.format(item), **angular_view),
        url(r'^{}s$'.format(item), **angular_view),
    ]
