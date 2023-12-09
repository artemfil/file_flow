from django.db import models
from django_minio_backend import MinioBackend, iso_date_prefix


class Files(models.Model):
    type = models.CharField(max_length=5, default=' ')
    size = models.BigIntegerField(default=1)
    file_name = models.CharField(max_length=50, default=' ')
    file_link = models.URLField(default=' ')
    file = models.FileField(storage=MinioBackend(bucket_name='fileflow'), upload_to=iso_date_prefix)
    sender = models.ForeignKey('Users', models.DO_NOTHING, related_name='files_sender')
    recipient = models.ForeignKey('Users', models.DO_NOTHING, related_name='files_recipient')

    class Meta:
        db_table = 'files'


class Users(models.Model):
    name = models.CharField(max_length=30)
    surname = models.CharField(max_length=30)
    telephone = models.CharField(max_length=11)
    login = models.CharField(max_length=30, null=False, unique=True, default='login')
    password = models.CharField(max_length=30, null=False, default='123')

    class Meta:
        db_table = 'users'
