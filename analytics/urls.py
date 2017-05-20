from django.conf.urls import url

from analytics.views import AnalyticView, StatisticView

urlpatterns = [
    url(r'ping$', AnalyticView.as_view()),
    url(r'statistics$', StatisticView.as_view()),
]
