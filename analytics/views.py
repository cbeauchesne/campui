from django.views.generic import View
from django.http import HttpResponse
from analytics.models import Statistic, Analytic, PageState, Domain
import datetime


class AnalyticView(View):
    def post(self, request, *args, **kwargs):
        referer = request.META.get('HTTP_REFERER').split("/")

        domain = referer[2] if len(referer) >= 3 else request.META.get('HTTP_REFERER')
        page_state = referer[3].split("?")[0] if len(referer) >= 4 else ""

        ps_object, _ = PageState.objects.get_or_create(name=page_state)
        domain_object, _ = Domain.objects.get_or_create(name=domain)

        Analytic.objects.create(page_state=ps_object, domain=domain_object)

        return HttpResponse("")


class StatisticView(View):
    def get(self, request, *args, **kwargs):
        date = datetime.date.today()

        states = PageState.objects.get()
        domains = Domain.objects.get()

        statistics = []
        for state in states:
            for domain in domains:
                count = Statistic.objects.filter(domain=domain,
                                                 page_state=state,
                                                 date__contains=date).count()

                statistics.append(Statistic(date=date,
                                            page_state=state,
                                            domain=domain,
                                            count=count))

        Statistic.objects.filter(date=date).delete()
        Statistic.objects.bulk_create(statistics)
