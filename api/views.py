from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http.response import HttpResponseBadRequest
from rest_framework.response import Response
from rest_framework.views import APIView

from . import serializers, authenticators


class CurrentUserView(APIView):
    def get(self, request, *args, **kwargs):
        data = serializers.UserSerializer(request.user).data
        return Response(data)

    def put(self, request, *args, **kwargs):
        if request.user.is_anonymous():
            return HttpResponseBadRequest()

        request.user.profile.params = request.data["profile"]["params"]

        request.user.profile.save()

        return Response("ok")


class UserView(APIView):
    def get(self, request, *args, **kwargs):
        user = User.objects.get(username=self.kwargs['username'])
        data = serializers.UserSerializer(user).data
        if user.is_anonymous():
            data["profile"]["params"] = {}

        return Response(data)


class AuthView(APIView):
    authentication_classes = (authenticators.QuietBasicAuthentication,)

    def post(self, request, *args, **kwargs):
        if request.user.is_anonymous():
            return HttpResponseBadRequest()

        login(request, request.user)
        return Response(serializers.UserSerializer(request.user).data)

    def delete(self, request, *args, **kwargs):
        logout(request)
        return Response()
