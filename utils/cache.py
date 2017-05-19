
from collections import OrderedDict


class Cache(object):
    def __init__(self, data_provider, max_size=2048):
        self._data = OrderedDict()
        self.max_size = max_size
        self.data_provider = data_provider

    def __call__(self, key):
        try:
            return self._data[key]
        except KeyError:
            result = self.data_provider(key)

            if len(self._data) > self.max_size:
                self._data.popitem(last=False)

            self._data[key] = result
    
            return result

    def remove(self, key):
        del self._data[key]

    def update(self, key, value):
        if key in self._data:
            self._data[key] = value
