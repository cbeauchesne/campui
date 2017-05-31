from datetime import datetime
from uuid import uuid4

from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http.response import HttpResponseBadRequest
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import BasicAuthentication

from wapi.core import get_document
from wapi.models import Document

from . import serializers
from .forum import forum


class ForumView(APIView):
    def get(self, request, *args, **kwargs):
        data = forum.latest
        return Response({"result": data})


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
        user = User.objects.get(username=self.kwargs['username'].lower())
        data = serializers.UserSerializer(user).data
        if user.is_anonymous():
            data["profile"]["params"] = {}

        return Response(data)


class AuthView(APIView):
    def post(self, request, *args, **kwargs):
        userid, password = request.data['username'], request.data['password']
        userid = userid.lower()

        auth = BasicAuthentication()
        user, _ = auth.authenticate_credentials(userid, password)

        if user.is_anonymous():
            return HttpResponseBadRequest("Fail to connect")

        login(request, user)
        return Response(serializers.UserSerializer(user).data)

    def delete(self, request, *args, **kwargs):
        logout(request)
        return Response()


class CreateUserView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            username, password = request.data['username'], request.data['password']
            username = username.lower()
        except:
            return HttpResponseBadRequest("")

        try:
            User.objects.create_user(username, password=password)
        except IntegrityError:
            return HttpResponseBadRequest("User still exists")
        except:
            return HttpResponseBadRequest("")

        auth = BasicAuthentication()
        user, _ = auth.authenticate_credentials(username, password)

        login(request, user)
        return Response(serializers.UserSerializer(user).data)


class DiscussionView(APIView):
    doc = None

    def _init_document(self, name):
        assert not self.request.user.is_anonymous()

        try:
            self.doc = get_document(name)
        except ObjectDoesNotExist:
            self.doc = Document(name=name,
                                comment="creation",
                                data={"subjects": []})

    @property
    def _subjects(self):
        return self.doc.data["subjects"]

    def _add_response(self, subject, response):

        subject["responses"].append({"content": response,
                                     "author": self.request.user.username,
                                     "date": datetime.utcnow().isoformat(),
                                     "id": str(uuid4())})

        self.doc.comment = subject["title"] + " : " + response[0:30]

    def _get_subject(self, subject_id):
        return [s for s in self._subjects if s["id"] == subject_id][0]

    def put(self, request, name):  # create subject
        self._init_document(name)

        subject = {"responses": []}

        subject["title"] = request.data["title"]
        response = request.data["response"]
        subject["id"] = str(uuid4())

        self._subjects.append(subject)
        self._add_response(subject, response)

        self.doc.save()

        return Response(self.doc.to_json())

    def post(self, request, name):  # create response
        self._init_document(name)
        response = request.data["response"]
        subject_id = request.data["subjectId"]
        subject = self._get_subject(subject_id)

        self._add_response(subject, response)

        self.doc.save()

        return Response(self.doc.to_json())
