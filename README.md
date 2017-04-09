# CampUI
Backend for [CampToCamp friendly user interface](https://github.com/cbeauchesne/campui-frontend)

## Installing
Asserting you have still installed [Python 3.4](https://www.python.org/), [virtualenv](https://virtualenv.pypa.io/en/stable/) and [PostgreSQL](https://www.postgresql.org/).

* create a DB called `campui` in PostgreSQL running on port 5432. Add a connection user charles@charles (or modify campui/settings.py).
* [Download package](https://github.com/cbeauchesne/campui/archive/master.zip), unzip it, and in root folder in prompt : 
* run `python setup.py install` : install all dependencies
* run `python manage.py migrate` : create tables in DB
* run `python manage.py createsuperuser` : create first admin user

## Run
* run `python manage.py runserver`
* go to http://localhost:8000/admin
