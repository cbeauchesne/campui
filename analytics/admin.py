from django.contrib import admin
from analytics.models import Statistic, Analytic, PageState, Domain


class AnalyticAdmin(admin.ModelAdmin):
    list_display = ['page_state', 'domain', 'timestamp']


class PageStateAdmin(admin.ModelAdmin):
    pass


class DomainAdmin(admin.ModelAdmin):
    pass


class StatisticAdmin(admin.ModelAdmin):
    list_display = ['page_state', 'domain', 'date', 'count']


admin.site.register(Statistic, StatisticAdmin)
admin.site.register(Analytic, AnalyticAdmin)
admin.site.register(PageState, PageStateAdmin)
admin.site.register(Domain, DomainAdmin)
