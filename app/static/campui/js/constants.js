

var c2cItems = {
    user:{
        label:"name",
        detailled_controller: "linkedOutingsController",
        itemLinkTemplate: '<a ui-sref="stories({u:user.user_id || user.document_id})">{{user.name}}</a>'
    },
    outing:{},
    route:{
        label_prefix:"title_prefix",
    },
    article:{},
    waypoint:{},
    xreport:{},
    image:{},
    area:{},
}

angular.module("campui").constant("letterToC2cItem", {
        o:"outing",
        r:"route",
        w:"waypoint",
        a:"area",
        x:"xreport",
    }
)