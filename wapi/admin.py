from django.contrib import admin
from .models import Document
from simple_history.admin import SimpleHistoryAdmin


@admin.register(Document)
class DocumentAdmin(SimpleHistoryAdmin):
    list_display = ['name', ]
