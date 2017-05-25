from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^document/(?P<name>.*)$', views.DocumentView.as_view()),
]
