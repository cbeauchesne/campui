from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic.base import TemplateView
from api.urls import urlpatterns as api_urls

admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls)),
    url(r'^.*$', TemplateView.as_view(template_name='base.html'), name='home'),
]
