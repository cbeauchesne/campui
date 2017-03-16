from django.conf.urls import url, include
from rest_framework import routers

from . import views as views


router = routers.DefaultRouter()
router.register(r'auth', views.AuthView, 'list')
router.register(r'user', views.UserView, 'list')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^auth/$', views.AuthView.as_view(), name='authenticate'),
    url(r'^user/(?P<username>[a-zA-Z0-9-]+)$', views.UserView.as_view(), name='user'),
    url(r'^current_user', views.CurrentUserView.as_view(), name='user'),

]