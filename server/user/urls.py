from django.urls import path
from user import views


urlpatterns = [
    path('login/', views.LoginView.as_view()),
    path('shared-cameras/', views.SharedCamerasView.as_view()),
    path('shared-cameras/<str:camera_id>/', views.SharedCameraRecordingsView.as_view()),
    path('recordings/', views.SharedCameraRecordsView.as_view()),
    path('recording/stream/', views.SharedCameraStreamRecordingView.as_view()),
    path('logout/', views.LogoutView.as_view())
]