import re
import django_filters

from rest_framework import status
from rest_framework import viewsets
from rest_framework import permissions
from zad1.zad1.tasks import send_email
from rest_framework.response import Response
from zad1.zad1.models import Mailbox, Template, Email
from zad1.zad1.serializers import MailboxSerializer, TemplateSerializer, EmailSerializer


class MailboxViewSet(viewsets.ModelViewSet):
    queryset = Mailbox.objects.all()
    serializer_class = MailboxSerializer
    #permission_classes = [permissions.IsAuthenticated]

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    #permission_classes = [permissions.IsAuthenticated]

class EmailFilterSet(django_filters.FilterSet):
    missing = django_filters.BooleanFilter(field_name='sent_date', lookup_expr='isnull')

    class Meta:
        model = Email
        fields = ['sent_date', 'date'] 

class EmailViewSet(viewsets.ModelViewSet):
    queryset = Email.objects.all()
    serializer_class = EmailSerializer
    #permission_classes = [permissions.IsAuthenticated]
    filterset_class = EmailFilterSet

    def create(self, request):
        pk = request.POST['mailbox']

        if re.search("^http", pk):
            pk = pk.split('/')[-2]

        mailbox = Mailbox.objects.get(pk=pk)

        pk = request.POST['template']

        if re.search("^http", pk):
            pk = pk.split('/')[-2]

        template = Template.objects.get(pk=pk)

        if mailbox and mailbox.is_active:
            email = Email(mailbox=mailbox, template=template, to=request.POST['to'])
            email.save()

            send_email.delay(email.id)

            return Response({'message': "OK!", 'status': "success"}, status=status.HTTP_200_OK)
        else:
            return Response({'message': "Mailbox inactive. Please activate it first!", 'status': "error"}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        return Response({'message': "Unsupported request!", 'status': "error"}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        return Response({'message': "Unsupported request!", 'status': "error"}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return Response({'message': "Unsupported request!", 'status': "error"}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        return Response({'message': "Unsupported request!", 'status': "error"}, status=status.HTTP_400_BAD_REQUEST)