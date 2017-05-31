from .models import Document


def get_document(name):
    return Document.objects.get(name=name)
