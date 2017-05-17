from django.db import models

class PageState(models.Model):
    name = models.CharField(max_length=64, unique=True)


class Domain(models.Model):
    name = models.CharField(max_length=64, unique=True)


class Analytic(models.Model):
    page_state = models.ForeignKey(PageState)
    domain = models.ForeignKey(Domain)
    timestamp = models.DateTimeField(auto_now_add=True)
