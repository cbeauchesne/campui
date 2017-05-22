from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import JSONField

import json


def _is_json(s):
    try:
        json.loads(s)
    except Exception as e:
        raise ValidationError("Invalid JSON format : {}".format(e)) from e


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    params = JSONField(default=dict)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


"""
class Document(object):
    name = models.CharField(max_length=256, unique=True)
    metadata = JSONField(default=dict)
    content = models.CharField()
"""

"""
/special/login
/special/register

/nom de site : nom de voie => page nds : ndv, rendu route
/le portail de la patate => page le portail de la patate, rendu portal

/user/coucou  => page user/coucou, espace de nom user
/area/xxx     => page area/xxx esapace de nom area
/


"""