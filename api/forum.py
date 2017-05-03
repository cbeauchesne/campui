from threading import Thread, Lock
from time import sleep
from urllib.request import urlopen


class Forum(Thread):
    def __init__(self):
        self._top = "{}"
        self._latest = "{}"
        self.lock = Lock()
        Thread.__init__(self)

    def run(self):
        while True:
            try:
                # top = urlopen("https://forum.camptocamp.org/top.json").read()
                latest = urlopen("https://forum.camptocamp.org/latest.json").read()

                self.lock.acquire()
                # self._top = top
                self._latest = latest

            finally:
                self.lock.release()

            sleep(30)

    def _safe_value(self, name):
        self.lock.acquire()
        result = getattr(self, name)
        self.lock.release()

        return result

    @property
    def top(self):
        return self._safe_value("_top")

    @property
    def latest(self):
        return self._safe_value("_latest")


forum = Forum()
forum.start()
