from django.db import models


class PageState(models.Model):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return self.name


class Domain(models.Model):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return self.name

    
# this correspond to a page view
# it will be the big data object
class Analytic(models.Model):
    page_state = models.ForeignKey(PageState)
    domain = models.ForeignKey(Domain)
    timestamp = models.DateTimeField(auto_now_add=True)

    
# This will be the real statistic object
# few object in DB (once per date/domain/state)
# and anonymised as it will be public
# count means count of Analytic() object
class Statistic(models.Model):
    date = models.DateField()
    page_state = models.ForeignKey(PageState)
    domain = models.ForeignKey(Domain)
    count = models.IntegerField()
