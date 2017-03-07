import cryptacular.bcrypt

from sqlalchemy import (
    Column,
)

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    synonym,
)

from sqlalchemy.types import (
    Integer,
    Unicode,
)

from sqlalchemy.ext.declarative import declarative_base

from zope.sqlalchemy import ZopeTransactionExtension

from pyramid.security import (
    Everyone,
    Authenticated,
    Allow,
)

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()

crypt = cryptacular.bcrypt.BCRYPTPasswordManager()


def hash_password(password):
    return crypt.encode(password)


class User(Base):
    """
    Application's user model.
    """
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True)
    name = Column(Unicode(20), unique=True)
    email = Column(Unicode(50))
    _password = Column('password', Unicode(60))

    def _get_password(self):
        return self._password

    def _set_password(self, password):
        self._password = hash_password(password)

    password = property(_get_password, _set_password)
    password = synonym('_password', descriptor=password)

    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password

    @classmethod
    def get_by_name(cls, name):
        return DBSession.query(cls).filter(cls.name == name).first()

    @classmethod
    def check_password(cls, name, password):
        user = cls.get_by_name(name)
        if not user:
            return False
        return crypt.check(user.password, password)


class RootFactory(object):
    __acl__ = [
        (Allow, Everyone, 'view'),
        (Allow, Authenticated, 'post')
    ]

    def __init__(self, request):
        pass  # pragma: no cover
