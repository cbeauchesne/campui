from django.contrib.auth.models import User
from django import forms
from captcha.fields import CaptchaField


class UserForm(forms.ModelForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'password'}))
    captcha = CaptchaField()

    class Meta:
        model = User
        fields = ("username",)
