from django.contrib.auth.models import User
from django.http.response import HttpResponse, HttpResponseBadRequest
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Document


def get_document(name):
    return Document.objects.get(name=name)


class DocumentView(APIView):
    def get(self, request, name):
        doc = get_document(name)

        view = request.query_params.get('view', None)

        if not view:
            return Response({"id": doc.id,
                             "name": doc.name,
                             "metadata": doc.metadata,
                             "content": doc.content})

        if view == "raw":
            response = HttpResponse(doc.content, content_type="text/plain")
            return response

        return HttpResponseBadRequest("Unexpected view mode")

    def post(self, request, name):
        doc = get_document(name=name)
        new_doc = request.data["document"]
        comment = request.data["comment"]

        doc.content = new_doc["content"]
        doc.save()

        return Response("ok")
