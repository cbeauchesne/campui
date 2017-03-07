from pyramid.view import view_config

# from pyramid_simpleform import Form
# from pyramid_simpleform.renderers import FormRenderer
#
# import formencode
#
# from .models import (
#     DBSession,
#     User,
# )
#
#
# from pyramid.httpexceptions import (
#     HTTPMovedPermanently,
#     HTTPFound,
#     HTTPNotFound,
#     )
#
#
# from pyramid.security import (
#     authenticated_userid,
#     remember,
#     forget,
#     )


@view_config(route_name='dashboard', renderer='templates/index.jinja2')
def dashboard(request):
    return {'project': 'campui'}


@view_config(route_name='index', renderer='templates/index.jinja2')
def outings(request):
    return {'project': 'campui'}

#
# class RegistrationSchema(formencode.Schema):
#     allow_extra_fields = True
#     password = formencode.validators.PlainText(not_empty=True)
#     email = formencode.validators.Email(resolve_domain=False)
#     name = formencode.validators.String(not_empty=True)
#     password = formencode.validators.String(not_empty=True)
#     confirm_password = formencode.validators.String(not_empty=True)
#     chained_validators = [
#         formencode.validators.FieldsMatch('password', 'confirm_password')
#     ]
#
#
# @view_config(route_name='register', renderer='templates/register.jinja2')
# def user_add(request):
#     form = Form(request, schema=RegistrationSchema)
#
#     if 'form.submitted' in request.POST and form.validate():
#         session = DBSession()
#         name = form.data['name']
#         user = User(
#             password=form.data['password'],
#             name=name,
#             email=form.data['email']
#         )
#         session.add(user)
#
#         headers = remember(request, name)
#
#         redirect_url = request.route_url('main')
#
#         return HTTPFound(location=redirect_url, headers=headers)
#
#     login_form = login_form_view(request)
#
#     return {
#         'form': FormRenderer(form),
#         'toolbar': toolbar_view(request),
#         'cloud': cloud_view(request),
#         'latest': latest_view(request),
#         'login_form': login_form,
#     }
