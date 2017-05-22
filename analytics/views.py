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
    def get(self, request, *args, **kwargs):
        from_date = datetime.date.today() - datetime.timedelta(days=20)

        statistics = [StatisticSerializer(s).data for s in Statistic.objects.filter(date__gte=from_date).order_by('date')]
        page_states = [PageStateSerializer(p).data for p in PageState.objects.all()]
        domains = [DomainSerializer(d).data for d in Domain.objects.all()]

        return Response({"statistics": statistics,
                         "page_states": page_states,
                         "domains": domains})

