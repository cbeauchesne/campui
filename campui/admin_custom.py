from django.contrib import admin
from django.contrib.auth.models import User


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'is_staff', 'is_superuser', 'last_login')
    list_filter = ('is_staff', 'is_superuser')


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
