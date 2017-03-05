from pyramid.view import view_config


@view_config(route_name='dashboard', renderer='templates/index.jinja2')
def dashboard(request):
    return {'project': 'campui'}


@view_config(route_name='index', renderer='templates/index.jinja2')
def outings(request):
    return {'project': 'campui'}
