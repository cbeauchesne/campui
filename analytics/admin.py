from django.contrib import admin
from analytics.models import Analytic, PageState, Domain
from django import forms


class AnalyticAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(AnalyticAdminForm, self).__init__(*args, **kwargs)
        self.fields['domain'].widget = admin.widgets.AdminTextareaWidget()


class AnalyticAdmin(admin.ModelAdmin):
    pass
    list_display = ['page_state', 'domain', 'timestamp']


class PageStateAdmin(admin.ModelAdmin):
    pass


class DomainAdmin(admin.ModelAdmin):
    pass


admin.site.register(Analytic, AnalyticAdmin)
admin.site.register(PageState, PageStateAdmin)
admin.site.register(Domain, DomainAdmin)
