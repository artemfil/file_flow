from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from lab3.models import Users, Files

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ('id', 'name', 'surname','telephone', 'login', 'password')


class FilesSerializer(ModelSerializer):
    class Meta:
        model = Files
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(FilesSerializer, self).__init__(*args, **kwargs)
        self.fields['size'].required = False
        self.fields['type'].required = False


