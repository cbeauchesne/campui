from django.db import models
from django.contrib.postgres.fields import JSONField
from simple_history.models import HistoricalRecords


# Create your models here.


class Document(models.Model):
    name = models.CharField(max_length=256, unique=True)
    metadata = JSONField(default=None, null=True, blank=True)
    content = models.TextField()
    history = HistoricalRecords()
    comment = models.CharField(max_length=256, blank=True)

    def __str__(self):
        return self.name

    def to_json(self):
        return {"id": self.id,
                "name": self.name,
                "metadata": self.metadata,
                "content": self.content,
                "comment": self.comment}
