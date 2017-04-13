## Install

[Download package](https://github.com/cbeauchesne/campui/archive/master.zip), unzip it, and execute : 

### Front-end (stand alone Web app)
You must have installed [Node.js](https://nodejs.org/en/)
1. `npm install` : install node package
2. `bower install` : install web package
3. `gulp` : it will open http://localhost:3000. :tada:


### Back end
You must have installed [Python 3.4](https://www.python.org/), and [PostgreSQL 9.4](https://www.postgresql.org/).

1. create a DB called `campui` in PostgreSQL running on port 5432. Add a connection user named *campui* and password *campui* (or modify campui/settings.py).
2. `pip install -r requirements.txt` :  install all dependencies
3. `python manage.py migrate` : create tables in DB
4. `python manage.py createsuperuser` : create first admin user
5. `python manage.py runserver` : got to http://localhost:3000, it will be able to use your backend. :tada:

## Develop
* When `gulp` is running, modify whatever on app/
* When `python manage.py runserver` is running, modify whatever in api/
* `guild build` : Build web app. Test it on http://localhost:8000 :tada:

