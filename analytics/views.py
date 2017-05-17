from django.views.generic import View
from django.http import HttpResponse
from analytics.models import Analytic, PageState, Domain


class AnalyticView(View):
    def post(self, request, *args, **kwargs):
        referer = request.META.get('HTTP_REFERER').split("/")

        domain = referer[2] if len(referer) >= 3 else request.META.get('HTTP_REFERER')
        page_state = referer[3] if len(referer) >= 4 else ""

        ps_object, _ = PageState.objects.get_or_create(name=page_state)
        domain_object, _ = Domain.objects.get_or_create(name=domain)

        Analytic.objects.create(page_state=ps_object, domain=domain_object)

        return HttpResponse("")
