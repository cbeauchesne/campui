from django.conf.urls import include, url
from django.contrib import admin
from api.urls import urlpatterns as api_urls
from api import views as www_views

admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls)),
    url(r'^captcha/', include('captcha.urls')),
    url(r'^register', www_views.register, name='register'),
]
