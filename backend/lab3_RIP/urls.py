from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from lab3 import views
from django.urls import include, path, re_path
from rest_framework import routers
from lab3.views import UserViewSet, FileViewSets, upload_or_get, delete_file, \
    user_without_id, sender_recipient
from lab3 import consumers


router = routers.DefaultRouter()
router.register(r'user', UserViewSet)
router.register(r'file', FileViewSets)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/drf-auth/', include('rest_framework.urls')),
    path('api/v1/', include(router.urls)),
    path('api/v1/userwid/<int:id>/', views.user_without_id),
    path('api/v1/send_rec/<int:id_s>_<int:id_r>/', views.sender_recipient),
    path('upload/', views.upload_or_get, name="upload"),
    path('upload/<int:id>', views.delete_file, name="delete"),
]

# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
