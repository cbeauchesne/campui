import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, 'README.txt')) as f:
    README = f.read()


requires = [
    'django==1.10.6',
    'djangorestframework==3.6.0',
    'psycopg2==2.7.1',  # postgresql
]

tests_require = [
]

setup(
    name='campui',
    version='0.0',
    description='campui',
    long_description=README,
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Django',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Application',
    ],
    author='',
    author_email='',
    url='',
    keywords='',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    extras_require={
        'testing': tests_require,
    },
    install_requires=requires,
    entry_points={},
)
