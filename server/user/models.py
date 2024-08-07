# from django.db import models

# # Create your models here.
# class AngelcamUser(models.Model):
#     owner = models.ForeignKey('auth.User', related_name='angelcam_user', on_delete=models.CASCADE)
#     token = models.TextField()
#     angelcam_id = models.IntegerField(primary_key=True)
#     # first_name = models.CharField(max_length=100,)
#     # last_name = models.CharField(max_length=100,)
#     # email = models.CharField(max_length=100,)
#     shared_cameras_count = models.IntegerField()
#     created = models.DateTimeField(auto_now_add=True,)
