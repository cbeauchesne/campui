# CampUI
CampToCamp friendly user interface

## Installing
Asserting you have still installed [Git](https://git-scm.com/), [Python 3.5](https://www.python.org/) and [PostgreSQL](https://www.postgresql.org/)

* create a DB called `campui` in PostgreSQL (running on port 5432)
* Download package, unzip it, and in root folder in prompt : 
* run `python manage.py migrate`
* run `python manage.py createsuperuser`

## Run
* run `python manage.py runserver`
