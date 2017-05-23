from django.core.management.base import BaseCommand
from analytics.models import Statistic, Analytic, PageState, Domain
import datetime


class Command(BaseCommand):
    help = 'Compute statistics from analytics'

    def handle(self, *args, **options):

        date = datetime.date.today()

        for i in range(3):
            _compute(date)
            date = date + datetime.timedelta(days=-1)


def _compute(date):
    print("compute", date)
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

    print("delete olds")
    Statistic.objects.filter(date=date).delete()

    print("insert news")
    Statistic.objects.bulk_create(statistics)

    print("finished", date)
