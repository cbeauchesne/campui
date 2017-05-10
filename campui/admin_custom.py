from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin


class MyUserAdmin(UserAdmin):
    list_display = ('username', 'is_staff', 'is_superuser', 'last_login')
    list_filter = ('is_staff', 'is_superuser')


admin.site.unregister(User)
admin.site.register(User, MyUserAdmin)
