from __future__ import print_function, unicode_literals

from c2corg_common import document_types, associations, attributes, fields_area, fields_article, fields_book, \
    fields_image, fields_outing, fields_route, fields_topo_map, fields_user_profile, fields_waypoint, fields_xreport, \
    sortable_search_attributes

import json
import inspect
import io

result = {}


def publics(module):
    return {item: value for item, value in inspect.getmembers(module) if not item.startswith("_")}


# result["associations"] = publics(associations) fail..


result["attributes"] = publics(attributes)
# result["document_types"] = publics(document_types)
# result["fields_area"] = publics(fields_area)
# result["fields_article"] = publics(fields_article)
# result["fields_book"] = publics(fields_book)
# result["fields_image"] = publics(fields_image)
# result["fields_outing"] = publics(fields_outing)
# result["fields_route"] = publics(fields_route)
# result["fields_topo_map"] = publics(fields_topo_map)
# result["fields_user_profile"] = publics(fields_user_profile)
# result["fields_waypoint"] = publics(fields_waypoint)
# result["fields_xreport"] = publics(fields_xreport)
# result["sortable_search_attributes"] = publics(sortable_search_attributes)

js = json.dumps(result, indent=4)

dump = "angular.module('campui').factory('c2c_common', function(){{\n return {};\n}})".format(js)

io.open("static/campui/js/c2c_common.js", "w").write(dump)
