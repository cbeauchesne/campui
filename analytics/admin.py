from django.contrib import admin
from analytics.models import Analytic


class AnalyticAdmin(admin.ModelAdmin):
    list_display = ['page_state', 'domain', 'timestamp']


admin.site.register(Analytic, AnalyticAdmin)
