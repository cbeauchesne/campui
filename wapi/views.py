from django.contrib.auth.models import User
from django.http.response import HttpResponse, HttpResponseBadRequest
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Document


def get_document(name):
    return Document.objects.get(name=name)


def _versions_to_json(versions):
    return [{"id": v.history_id,
             "date": v.history_date,
             "user": v.history_user.username if v.history_user else None,
             "document": v.history_object.to_json()} for v in versions]


class DocumentView(APIView):
    def get(self, request, name):

        view = request.query_params.get('view', None)

        if not view:
            doc = get_document(name)
            return Response(doc.to_json())

        if view == "raw":
            doc = get_document(name)
            response = HttpResponse(doc.content, content_type="text/plain")
            return response

        if view == "history":
            doc = get_document(name)
            versions = _versions_to_json(doc.history.all())

            return Response({"name": name,
                             "versions": versions})

        return HttpResponseBadRequest("Unexpected view mode")

    def post(self, request, name):
        doc = get_document(name=name)
        new_doc = request.data["document"]

        doc.content = new_doc["content"]
        doc.comment = new_doc["comment"]
        doc.save()

        return Response("ok")


class RecentChangesView(APIView):
    def get(self, request):
        limit = request.query_params.get('limit', None)
        offest = request.query_params.get('offest', None)

        versions = _versions_to_json(Document.history.all())

        return Response({"versions": versions})
