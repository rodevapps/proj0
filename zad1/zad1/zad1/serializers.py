from zad1.zad1.models import Mailbox, Template, Email
from rest_framework import serializers


class MailboxSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Mailbox
        fields = '__all__'

class TemplateSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'

class EmailSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Email
        fields = '__all__'