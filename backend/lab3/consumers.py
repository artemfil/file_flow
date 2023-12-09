import base64
import io
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import json
from djangochannelsrestframework import mixins
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
from djangochannelsrestframework.observer.generics import (action, ObserverModelInstanceMixin)
from minio import Minio
from .models import Users, Files
from .serializers import UserSerializer, FilesSerializer

stroke = ''
chunk_completed = 0
chunk_all = 0


class ChatConsumer(ObserverModelInstanceMixin, WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data, **kwargs):
        global stroke, chunk_completed, chunk_all
        file_data = json.loads(text_data)
        client = Minio(endpoint='localhost:9000',
                       access_key='minio',
                       secret_key='minio124',
                       secure=False)
        # Convert decode the base64 data
        chunk_completed = file_data['chunk_now']
        chunk_all = file_data['chunk_all']
        file_b64 = file_data['file_content']
        stroke = stroke + file_b64
        file_size = file_data['file_size']
        file_type = file_data['file_extension']
        sender = file_data['sender']
        recipient = file_data['recipient']
        senderU = Users.objects.get(pk=sender)
        recipientU = Users.objects.get(pk=recipient)
        filename = file_data['file_name']
        self.send(text_data=json.dumps({
            'event': 'chunk',
            'chunk_completed': file_data['chunk_now'],
            'chunk_all': file_data['chunk_all'],
        }))
        if file_data['chunk_now'] == file_data['chunk_all']:
            file = io.BytesIO(base64.b64decode(stroke.split(',')[-1]))
            Files.objects.create(type=file_type, size=file_size, file_name=filename,
                                 sender=senderU, recipient=recipientU)
            client.put_object(bucket_name='fileflow',
                              object_name=filename,
                              data=file,
                              length=int(file_size))
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'file_post',
                    'filename': filename,
                    'size': file_size,
                    'sender': sender
                }
            )

    def file_post(self, event):
        filename = event['filename']
        file_size = event['size']
        sender = event['sender']

        self.send(text_data=json.dumps({
            'event': "Send",
            'file_name': filename,
            'size': file_size,
            'sender': sender
        }))


class UserConsumer(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.PatchModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    mixins.DeleteModelMixin,
    GenericAsyncAPIConsumer,
):
    queryset = Files.objects.all()
    serializer_class = FilesSerializer
