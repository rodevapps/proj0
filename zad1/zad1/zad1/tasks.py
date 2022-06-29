from celery.utils.log import get_task_logger
from django.core.mail import send_mass_mail
from zad1.zad1.models import Email
from celery import shared_task
from datetime import datetime

logger = get_task_logger(__name__)

@shared_task(name="send_email", bind=True, acks_late=False, autoretry_for=(Exception,), max_retries=3, retry_backoff=True, retry_backoff_max=500, retry_jitter=True)
def send_email(self, email_pk):
    logger.info(f'Send email task started!')

    try:
        email = Email.objects.get(pk=email_pk)

        sent = send_mass_mail(email.template.subject, email.template.text, email.mailbox.email_from, email.to, html_message=email.template.text, fail_silently=False)

        email.sent_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        email.save()

        logger.info(f'Sended {sent} emails!')

        return True
    except Email.DoesnNotExist():
        logger.info(f'Email object not found in databse!')
    except smtplib.SMTPException:
        logger.info(f'Email not sended correctly!')
    except:
        logger.info(f'Email sent_date not updated correctly!')
    
    return False