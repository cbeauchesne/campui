from rest_framework import serializers
from analytics.models import Statistic, PageState, Domain


class PageStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageState
        fields = ('id', 'name',)


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ('id', 'name',)


class StatisticSerializer(serializers.ModelSerializer):
    date = serializers.DateField()

    class Meta:
        model = Statistic
        fields = ('page_state', 'domain', 'date', 'count')
