from django.shortcuts import render

from .forms import UserForm
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect


def register(request):
    if request.method == "POST":
        form = UserForm(request.POST)
        if form.is_valid():
            new_user = User.objects.create_user(username=form.cleaned_data["username"],
                                                password=form.cleaned_data["password"])
            login(request, new_user)
            return HttpResponseRedirect('/')
    else:
        form = UserForm()

    return render(request, 'register.html', {'form': form})
