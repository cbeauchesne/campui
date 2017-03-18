from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic.base import TemplateView
from api.urls import urlpatterns as api_urls
from www import views as www_views

admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),

    url(r'^api/', include(api_urls)),

    url(r'^captcha/', include('captcha.urls')),

    url(r'^register', www_views.register, name='register'),

    url(r'^outings$', TemplateView.as_view(template_name='base.html'), name='home'),
    url(r'^routes$', TemplateView.as_view(template_name='base.html'), name='home'),
    url(r'^articles$', TemplateView.as_view(template_name='base.html'), name='home'),
    url(r'^xreports$', TemplateView.as_view(template_name='base.html'), name='home'),
    url(r'^credits$', TemplateView.as_view(template_name='base.html'), name='home'),
    url(r'^me$', TemplateView.as_view(template_name='base.html'), name='home'),

    url(r'^user/.*$', TemplateView.as_view(template_name='base.html'), name='home'),
    url(r'^route/.*$', TemplateView.as_view(template_name='base.html'), name='home'),

    url(r'^$', TemplateView.as_view(template_name='base.html'), name='home'),
]
