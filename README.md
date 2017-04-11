# CampUI

## Installing
You must installed [Python 3.4](https://www.python.org/), and [PostgreSQL 9.4](https://www.postgresql.org/).

* create a DB called `campui` in PostgreSQL running on port 5432. Add a connection user named *campui* and password *campui* (or modify campui/settings.py).
* [Download package](https://github.com/cbeauchesne/campui/archive/master.zip), unzip it, and in root folder in prompt : 
* `pip install -r requirements.txt` :  install all dependencies
* `python manage.py migrate` : create tables in DB
* `python manage.py createsuperuser` : create first admin user
* `npm install` : install node package
* `bower install` : install web package
* `guild build` : Build web app

## Run
* `python manage.py runserver`
* go to http://localhost:8000/

## develop
* `gulp`
* it will open http://localhost:3000. You can modify whatever you want in app/ (front-end) or in api/ (back-end)
