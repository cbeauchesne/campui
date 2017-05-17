from django.views.generic import View
from analytics.models import Analytic, PageState, Domain

class AnalyticView(APIView):
    def post(self, request, *args, **kwargs):
      referer = request.META.get('HTTP_REFERER').split("/")

      domain = referer[2] if len(referer >= 3) else request.META.get('HTTP_REFERER')
      page_state = referer[3] if len(referer >= 4) else ""

      Analytic.objects.create(page_state=PageState.objects.get_or_create(name=page_state),
                              referer=Domain.objects.get_or_create(name=domain))

      return ""
