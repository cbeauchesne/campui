from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^document/(?P<name>.*)$', views.DocumentView.as_view()),
    url(r'^contributions/(?P<username>.*)$', views.ContributionsView.as_view()),
    url(r'^recentchanges$', views.RecentChangesView.as_view()),
]

