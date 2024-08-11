from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework import status
import requests
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import datetime, timedelta

User = get_user_model()

class LoginView(APIView):
    """
    Login user using angelcam's api token and save user info to database.
    """
    def post(self, request):
        token_key = request.data.get("token")
        if not token_key:
            return Response({'error': 'token is required in the body'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            r = requests.get("https://api.angelcam.com/v1/me/", headers={
                'Authorization': 'PersonalAccessToken ' + token_key
            })
            
            if r.status_code == 200:
                data = r.json()

                # Try to authenticate user
                user = authenticate(username=data['email'], password=str(data['id']))
                if user is not None:
                    # User exists, log them in
                    login(request, user)
                    token, _ = Token.objects.get_or_create(user=user)
                    return Response(status=status.HTTP_200_OK)
                else:
                    # User doesn't exist, try to register
                    try:
                        user = User.objects.create_user(username=data['email'], password=str(data['id']), first_name=data['first_name'], last_name=data['last_name'])
                        Token.objects.create(user=user, key=token_key)
                        login(request, user)
                        return Response(status=status.HTTP_201_CREATED)
                    except IntegrityError:
                        # This could happen if the username is already taken
                        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
                    except Exception as e:
                        # Handle any other unexpected errors
                        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Handle error from angelcam's api
                error = r.json()
                error['angelcam'] = True
                return Response({"error": error}, status=r.status_code)
        except Exception as e:
            # Handle unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


class SharedCamerasView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        token, _ = Token.objects.get_or_create(user=user)

        try:
            r = requests.get("https://api.angelcam.com/v1/shared-cameras/", headers={
                'Authorization': 'PersonalAccessToken ' + token.key
            })
            
            if r.status_code == 200:
                data = r.json()
                return Response({
                    'cameras': data,
                })
            else:
                # Handle error from angelcam's api
                error = r.json()
                error['angelcam'] = True
                return Response({"error": error}, status=r.status_code)
        except Exception as e:
            # Handle unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SharedCameraRecordingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, camera_id):
        user = request.user
        token, _ = Token.objects.get_or_create(user=user)
        try:
          
            camera = requests.get("https://api.angelcam.com/v1/shared-cameras/"+camera_id+"/", headers={
                'Authorization': 'PersonalAccessToken ' + token.key
            })            

            if camera.status_code == 200:
                camera_data = camera.json()

                if camera_data['has_recording']:
                    # Get starting and end recording times.
                    r = requests.get("https://api.angelcam.com/v1/shared-cameras/"+camera_id+"/recording/", headers={
                        'Authorization': 'PersonalAccessToken ' + token.key
                    })
                    if r.status_code == 200:
                        recording_data = r.json()
                        start = recording_data['recording_start']
                        end = recording_data['recording_end']
                        
                        interval_pairs = get_daily_interval_pairs(start, end)

                        return Response({
                            'camera': camera_data,
                            'interval_pairs': interval_pairs
                        })
                    else:
                        # Handle error from angelcam's api
                        error = r.json()
                        error['angelcam'] = True
                        return Response({"error": error}, status=r.status_code)        
                else:
                    return Response({
                        'camera': camera_data,
                    })
            else:
                # Handle error from angelcam's api
                error = camera.json()
                error['angelcam'] = True
                return Response({"error": error}, status=camera.status_code)
        
        except Exception as e:
            # Handle unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SharedCameraRecordsView(APIView):
    def get(self, request):
        user = request.user
        token, _ = Token.objects.get_or_create(user=user)
        start = request.query_params['start']
        end = request.query_params['end']
        camera_id = request.query_params['camera_id']
        
        try:
            r = requests.get("https://api.angelcam.com/v1/shared-cameras/"+camera_id+"/recording/timeline/?start="+start+"&end="+end, headers={
                'Authorization': 'PersonalAccessToken ' + token.key
            })

            data = r.json()

            if r.status_code == 200:
                return Response({
                    'records': data
                })
            else:
                # Handle error from angelcam's api
                error = data.json()
                error['angelcam'] = True
                return Response({"error": error}, status=r.status_code)
        except Exception as e:
            # Handle unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SharedCameraStreamRecordingView(APIView):
    def get(self, request):
        user = request.user
        token, _ = Token.objects.get_or_create(user=user)
        start = request.query_params['start']
        end = request.query_params['end']
        camera_id = request.query_params['camera_id']

        try:
            r = requests.get("https://api.angelcam.com/v1/shared-cameras/"+camera_id+"/recording/stream/?start="+start+"&end="+end, headers={
                'Authorization': 'PersonalAccessToken ' + token.key,
                'Accept': 'application/json'
            })
            data = r.json()
            
            if r.status_code == 200:
                return Response({
                    'stream': data
                })
            else:
                # Handle error from angelcam's api
                error = data.json()
                error['angelcam'] = True
                return Response({"error": error}, status=r.status_code)
        except Exception as e:
            # Handle unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_daily_interval_pairs(start_time, end_time):
    # Parse the input strings to datetime objects
    start = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%SZ")
    end = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%SZ")
    
    # Adjust start to the beginning of its day
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # List to store the timestamp pairs
    timestamp_pairs = []
    
    # Start with the start time
    current = start
    
    # Generate timestamp pairs for each day
    while current < end:
        next_day = min(current + timedelta(days=1), end)
        
        pair = (
            current.strftime("%Y-%m-%dT%H:%M:%SZ"),
            next_day.strftime("%Y-%m-%dT%H:%M:%SZ")
        )
        timestamp_pairs.append(pair)
        
        if next_day == end:
            break
        
        current = next_day

    return timestamp_pairs