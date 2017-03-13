from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http.response import HttpResponseBadRequest
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import serializers, permissions, authenticators

import json


class UserView(APIView):
    def get(self, request, *args, **kwargs):
        user = User.objects.get(username=self.kwargs['username'])
        data = serializers.UserSerializer(user).data

        data["profile"]["parameters"] = "{}"

        data["profile"]["parameters"] = json.loads(data["profile"].get("parameters", "{}"))
        data["profile"]["outing_queries"] = json.loads(data["profile"]["outing_queries"])
        data["profile"]["image_queries"] = json.loads(data["profile"]["image_queries"])
        data["profile"]["route_queries"] = json.loads(data["profile"]["route_queries"])
        data["profile"]["xreport_queries"] = json.loads(data["profile"]["xreport_queries"])
        return Response(data)

    def put(self, request, *args, **kwargs):
        if request.user.is_anonymous():
            return HttpResponseBadRequest()

        user = User.objects.get(username=self.kwargs['username'])

        if not request.user.is_staff and request.user.username != user.username:
            return HttpResponseBadRequest()

        user.profile.c2c_id = request.data["profile"]["c2c_id"]
        user.profile.outing_queries = json.dumps(request.data["profile"]["outing_queries"])
        user.profile.image_queries = json.dumps(request.data["profile"]["image_queries"])
        user.profile.route_queries = json.dumps(request.data["profile"]["route_queries"])
        user.profile.xreport_queries = json.dumps(request.data["profile"]["xreport_queries"])

        user.profile.save()

        return Response("ok")


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
