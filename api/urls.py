from django.conf.urls import url, include
from rest_framework import routers

from . import views as views


router = routers.DefaultRouter()
router.register(r'users', views.UserView, 'list')
# router.register(r'posts', views.PostView, 'list')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^auth/$', views.AuthView.as_view(), name='authenticate')
]