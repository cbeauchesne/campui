from rest_framework.response import Response
from rest_framework.views import APIView
from analytics.models import Statistic, Analytic, PageState, Domain
from analytics.serializers import PageStateSerializer, DomainSerializer, StatisticSerializer

import datetime


class AnalyticView(APIView):
    def post(self, request, *args, **kwargs):
        referer = request.META.get('HTTP_REFERER').split("/")

        domain = referer[2] if len(referer) >= 3 else request.META.get('HTTP_REFERER')
        page_state = referer[3].split("?")[0] if len(referer) >= 4 else ""

        ps_object, _ = PageState.objects.get_or_create(name=page_state)
        domain_object, _ = Domain.objects.get_or_create(name=domain)

        Analytic.objects.create(page_state=ps_object, domain=domain_object)

        return Response("Ok")


class StatisticView(APIView):
    def post(self, request):

        date = datetime.date.today()

        result = []

        for i in range(10):
            date = date + datetime.timedelta(days=-1)
            self._compute(date)
            result += Statistic.objects.filter(date=date)  # marche pas..

        return Response(str(result))

    def get(self, request, *args, **kwargs):
        from_date = datetime.date.today() - datetime.timedelta(days=20)

        statistics = [StatisticSerializer(s).data for s in Statistic.objects.filter(date__gte=from_date)]
        page_states = [PageStateSerializer(p).data for p in PageState.objects.all()]
        domains = [DomainSerializer(d).data for d in Domain.objects.all()]

        return Response({"statistics": statistics,
                         "page_states": page_states,
                         "domains": domains})

    def _compute(self, date):
        states = PageState.objects.all()
        domains = Domain.objects.all()

        statistics = []
        for state in states:
            for domain in domains:
                count = Analytic.objects.filter(domain=domain,
                                                page_state=state,
                                                timestamp__contains=date).count()

                if count != 0:
                    statistics.append(Statistic(date=date,
                                                page_state=state,
                                                domain=domain,
                                                count=count))

        Statistic.objects.filter(date=date).delete()
        Statistic.objects.bulk_create(statistics)
