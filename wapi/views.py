from django.contrib.auth.models import User
from django.http.response import HttpResponse, HttpResponseBadRequest
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Document


def get_document(name):
    return Document.objects.get(name=name)


def get_document_version(name, hid=None):
    doc = get_document(name)

    if hid:
        return doc.history.get(history_id=hid)
    else:
        return doc.history.first()


def _version_to_json(v):
    result = v.history_object.to_json()

    result["hid"] = v.history_id
    result["date"] = v.history_date
    result["user"] = v.history_user.username if v.history_user else None

    return result


def _versions_to_json(versions):
    return [_version_to_json(v) for v in versions]


class DocumentView(APIView):
    def get(self, request, name):

        view = request.query_params.get('view', None)
        hid = request.query_params.get('hid', None)

        if not view:
            doc = get_document_version(name, hid)
            return Response(_version_to_json(doc))

        if view == "raw":
            doc = get_document_version(name, hid)
            response = HttpResponse(doc.history_object.content, content_type="text/plain")
            return response

        if view == "history":
            doc = get_document(name)
            limit = request.query_params.get('limit', None)
            offest = request.query_params.get('offest', None)
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
