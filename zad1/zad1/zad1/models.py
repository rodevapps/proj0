import uuid

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Mailbox(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.CharField("adres serwera SMTP", blank=False, max_length=200)
    port = models.IntegerField("port dla połączenia", blank=False, default=465, validators=[MinValueValidator(1), MaxValueValidator(65535)])
    login = models.CharField("", blank=False, max_length=200)
    password = models.CharField("", blank=False, max_length=200)
    email_from = models.CharField("nazwa nadawcy widoczna w mailu", blank=False, max_length=200)
    use_ssl = models.BooleanField("użycie SSL", default=True, blank=False)
    is_active = models.BooleanField("aktywność skrzynku", default=False, blank=True)
    date = models.DateTimeField("", auto_now_add=True)
    last_update = models.DateTimeField("wartość automatycznie zmieniana przy aktualizacji skrzynki", auto_now=True)

    @property
    def sent(self):
        #property zwracające ilość wysłanych ze skrzynki wiadomości
        return Email.objects.filter(mailbox=self.id).count()

class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField("temat wiadomości", blank=False, max_length=250)
    text = models.TextField("treść wiadomości", blank=False, max_length=10000)
    attachement = models.FileField("załącznik do wiadomości", blank=True, upload_to='', storage=None, max_length=100)
    date = models.DateTimeField("", auto_now_add=True)
    last_update = models.DateTimeField("wartość automatycznie zmieniana przy aktualizacji szablonu", auto_now=True)

class Email(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mailbox = models.ForeignKey('Mailbox', on_delete=models.CASCADE, blank=False)
    template = models.ForeignKey('Template', on_delete=models.CASCADE, blank=False)
    to = models.EmailField("odbiorca", max_length=100, default="example@example.com", blank=False)
    cc = models.EmailField("odbiorcy kopii wiadomości", max_length=100, blank=True, null=True)
    bcc = models.EmailField("odbiorcy ukrytej kopii wiadomości", max_length=100, blank=True, null=True)
    #to = ArrayField(models.EmailField("odbiorca", max_length=100), blank=False)
    #cc = ArrayField(models.EmailField("odbiorcy kopii wiadomości", max_length=100), blank=True)
    #bcc = ArrayField(models.EmailField("odbiorcy ukrytej kopii wiadomości", max_length=100), blank=True)
    reply_to = models.EmailField("adres na jaki ma odpowiedzieć odbiorca wiadomości", blank=True, null=True, max_length=100)
    sent_date = models.DateTimeField("data wysłania – pole uzupełniane po wysłaniu wiadomości", blank=True, null=True)
    date = models.DateTimeField("", auto_now_add=True)
