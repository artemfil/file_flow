from django.urls import re_path, path
from djangochannelsrestframework.consumers import view_as_consumer
from .views import upload_or_get, FileViewSets

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer),
]
