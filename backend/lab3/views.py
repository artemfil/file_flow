from django_filters import FilterSet, ChoiceFilter, filters
from django_filters.rest_framework import DjangoFilterBackend
from django_minio_backend import MinioBackend
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from lab3.serializers import UserSerializer, FilesSerializer
from lab3.models import Users, Files
from django.db.models import Q


class UserFilter(FilterSet):
    class Meta:
        model = Users
        fields = ['login']


class UserView(generics.ListAPIView):
    queryset = Users.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter


class FileViewSets(viewsets.ModelViewSet):
    queryset = Files.objects.all()
    serializer_class = FilesSerializer
    filter_backends = [DjangoFilterBackend]


class UserViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filter_class = UserFilter


@api_view(['POST', 'GET'])
def upload_or_get(request, *args, **kwargs):
    if request.method == 'POST':
        sender = request.data.get('sender')
        recipient = request.data.get('recipient')

        serializer = FilesSerializer(data=request.data)
        user1 = Users.objects.get(pk=sender)
        user2 = Users.objects.get(pk=recipient)
        # upload file to MINIO
        if serializer.is_valid():
            file = serializer.validated_data["file"]
            # get the format of file
            name = str(file).split(".")[0]
            type = str(file).split(".")[1]

            serializer.save(sender=user1, recipient=user2, file_name=name,
                            file_link="http://127.0.0.1:9000/fileflow/2023-11-13/metro_26KJw0d.png",
                            size=file.size, type=type)
            return Response(serializer.data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "GET":
        files = Files.objects.filter(sender=request.sender)
        serializer = FilesSerializer(files, many=True)
        return Response(serializer.data)

    return Response("Something Went Wrong", status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_file(request, id):
    if request.method == 'DELETE':
        file = Files.objects.get(id=id)
        file.delete()
        return Response("Deleted successfully ! ")


@api_view(['GET'])
def user_without_id(request, id):
    if request.method == "GET":
        user = Users.objects.filter(~Q(id=id))
        serializer = UserSerializer(user, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def sender_recipient(request, id_s, id_r):
    if request.method == "GET":
        file = Files.objects.filter(sender=id_s, recipient=id_r)
        serializer = FilesSerializer(file, many=True)
        return Response(serializer.data)
