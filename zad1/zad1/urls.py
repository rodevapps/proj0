from django.urls import include, path
from rest_framework import routers
from zad1.zad1 import views

router = routers.DefaultRouter()
router.register(r'mailbox', views.MailboxViewSet)
router.register(r'template', views.TemplateViewSet)
router.register(r'email', views.EmailViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]