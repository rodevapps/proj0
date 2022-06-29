from zad1.zad1.models import Mailbox, Template, Email
from django.core.management.base import BaseCommand
from zad1.zad1.tasks import send_email
from django.db import transaction
from django_seed import Seed

class Command(BaseCommand):
    @transaction.atomic
    def handle(self, **options):
        seeder = Seed.seeder()

        Email.objects.all().delete()
        Template.objects.all().delete()
        Mailbox.objects.all().delete()

        seeder.add_entity(Mailbox, 15, {
            'host': lambda x: seeder.faker.domain_name(),
            'login': lambda x: seeder.faker.email(),
            'password': lambda x: seeder.faker.lexify(text='??????????'),
            'email_from': lambda x: seeder.faker.email(),
        })

        seeder.add_entity(Template, 15, {
            'subject': lambda x: seeder.faker.sentence(),
            'text': lambda x: seeder.faker.paragraph(nb_sentences=5),
	})

        inserted_pks = seeder.execute()

        for x in range(15):
            email = Email(mailbox=Mailbox.objects.get(pk=inserted_pks[type(Mailbox())][x]), template=Template.objects.get(pk=inserted_pks[type(Template())][x]), to=seeder.faker.free_email(), reply_to=None, sent_date=None)
            email.save()

            send_email.delay(email.id)
