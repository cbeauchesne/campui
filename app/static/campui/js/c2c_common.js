angular.module('campui').factory('c2c_common', function(){
 return {
    "attributes": {
        "global_ratings": [
            "F",
            "F+",
            "PD-",
            "PD",
            "PD+",
            "AD-",
            "AD",
            "AD+",
            "D-",
            "D",
            "D+",
            "TD-",
            "TD",
            "TD+",
            "ED-",
            "ED",
            "ED+",
            "ED4",
            "ED5",
            "ED6",
            "ED7"
        ],
        "nb_outings": [
            "nb_outings_4",
            "nb_outings_9",
            "nb_outings_14",
            "nb_outings_15"
        ],
        "equipment_ratings": [
            "P1",
            "P1+",
            "P2",
            "P2+",
            "P3",
            "P3+",
            "P4",
            "P4+"
        ],
        "avalanche_slopes": [
            "slope_lt_30",
            "slope_30_35",
            "slope_35_40",
            "slope_40_45",
            "slope_gt_45"
        ],
        "orientation_types": [
            "N",
            "NE",
            "E",
            "SE",
            "S",
            "SW",
            "W",
            "NW"
        ],
        "weather_station_types": [
            "temperature",
            "wind_speed",
            "wind_direction",
            "humidity",
            "pressure",
            "precipitation",
            "precipitation_heater",
            "snow_height",
            "insolation"
        ],
        "mixed_ratings": [
            "M1",
            "M2",
            "M3",
            "M3+",
            "M4",
            "M4+",
            "M5",
            "M5+",
            "M6",
            "M6+",
            "M7",
            "M7+",
            "M8",
            "M8+",
            "M9",
            "M9+",
            "M10",
            "M10+",
            "M11",
            "M11+",
            "M12",
            "M12+"
        ],
        "via_ferrata_ratings": [
            "K1",
            "K2",
            "K3",
            "K4",
            "K5",
            "K6"
        ],
        "severities": [
            "severity_no",
            "1d_to_3d",
            "4d_to_1m",
            "1m_to_3m",
            "more_than_3m"
        ],
        "route_duration_types": [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "10+"
        ],
        "map_scales": [
            "25000",
            "50000",
            "100000"
        ],
        "rain_proof_types": [
            "exposed",
            "partly_protected",
            "protected",
            "inside"
        ],
        "activities": [
            "skitouring",
            "snow_ice_mixed",
            "mountain_climbing",
            "rock_climbing",
            "ice_climbing",
            "hiking",
            "snowshoeing",
            "paragliding",
            "mountain_biking",
            "via_ferrata",
            "slacklining"
        ],
        "book_types": [
            "topo",
            "environment",
            "historical",
            "biography",
            "photos-art",
            "novel",
            "technics",
            "tourism",
            "magazine"
        ],
        "user_categories": [
            "amateur",
            "mountain_guide",
            "mountain_leader",
            "ski_instructor",
            "climbing_instructor",
            "mountainbike_instructor",
            "paragliding_instructor",
            "hut_warden",
            "ski_patroller",
            "avalanche_forecaster",
            "club",
            "institution"
        ],
        "aid_ratings": [
            "A0",
            "A0+",
            "A1",
            "A1+",
            "A2",
            "A2+",
            "A3",
            "A3+",
            "A4",
            "A4+",
            "A5",
            "A5+"
        ],
        "autonomies": [
            "non_autonomous",
            "autonomous",
            "initiator",
            "expert"
        ],
        "months": [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec"
        ],
        "climbing_styles": [
            "slab",
            "vertical",
            "overhang",
            "roof",
            "small_pillar",
            "crack_dihedral"
        ],
        "author_statuses": [
            "primary_impacted",
            "secondary_impacted",
            "internal_witness",
            "external_witness"
        ],
        "article_types": [
            "collab",
            "personal"
        ],
        "image_types": [
            "collaborative",
            "personal",
            "copyright"
        ],
        "area_types": [
            "range",
            "admin_limits",
            "country"
        ],
        "default_langs": [
            "fr",
            "it",
            "de",
            "en",
            "es",
            "ca",
            "eu"
        ],
        "snowshoe_ratings": [
            "R1",
            "R2",
            "R3",
            "R4",
            "R5"
        ],
        "article_categories": [
            "mountain_environment",
            "gear",
            "technical",
            "topoguide_supplements",
            "soft_mobility",
            "expeditions",
            "stories",
            "c2c_meetings",
            "tags",
            "site_info",
            "association"
        ],
        "exposition_ratings": [
            "E1",
            "E2",
            "E3",
            "E4"
        ],
        "children_proof_types": [
            "very_safe",
            "safe",
            "dangerous",
            "very_dangerous"
        ],
        "map_editors": [
            "IGN",
            "Swisstopo",
            "Escursionista"
        ],
        "condition_ratings": [
            "excellent",
            "good",
            "average",
            "poor",
            "awful"
        ],
        "hiking_ratings": [
            "T1",
            "T2",
            "T3",
            "T4",
            "T5"
        ],
        "mailinglists": [
            "avalanche",
            "lawinen",
            "valanghe",
            "avalanche.en",
            "meteofrance-38",
            "meteofrance-74",
            "meteofrance-73",
            "meteofrance-04",
            "meteofrance-05",
            "meteofrance-06",
            "meteofrance-31",
            "meteofrance-64",
            "meteofrance-65",
            "meteofrance-66",
            "meteofrance-09",
            "meteofrance-andorre",
            "meteofrance-2a",
            "meteofrance-2b",
            "aran",
            "catalunya"
        ],
        "public_transportation_ratings": [
            "good service",
            "seasonal service",
            "poor service",
            "nearby service",
            "no service"
        ],
        "slackline_types": [
            "slackline",
            "highline",
            "waterline"
        ],
        "exposition_rock_ratings": [
            "E1",
            "E2",
            "E3",
            "E4",
            "E5",
            "E6"
        ],
        "custodianship_types": [
            "accessible_when_wardened",
            "always_accessible",
            "key_needed",
            "no_warden"
        ],
        "genders": [
            "male",
            "female"
        ],
        "glacier_ratings": [
            "easy",
            "possible",
            "difficult",
            "impossible"
        ],
        "labande_ski_ratings": [
            "S1",
            "S2",
            "S3",
            "S4",
            "S5",
            "S6",
            "S7"
        ],
        "ground_types": [
            "prairie",
            "scree",
            "snow"
        ],
        "risk_ratings": [
            "X1",
            "X2",
            "X3",
            "X4",
            "X5"
        ],
        "langs_priority": [
            "fr",
            "en",
            "it",
            "de",
            "es",
            "ca",
            "eu"
        ],
        "rock_types": [
            "basalte",
            "calcaire",
            "conglomerat",
            "craie",
            "gneiss",
            "gres",
            "granit",
            "migmatite",
            "mollasse_calcaire",
            "pouding",
            "quartzite",
            "rhyolite",
            "schiste",
            "trachyte",
            "artificial"
        ],
        "avalanche_signs": [
            "no",
            "danger_sign",
            "recent_avalanche",
            "natural_avalanche",
            "accidental_avalanche"
        ],
        "hut_status": [
            "open_guarded",
            "open_non_guarded",
            "closed_hut"
        ],
        "access_conditions": [
            "cleared",
            "snowy",
            "closed_snow",
            "closed_cleared"
        ],
        "feed_change_types": [
            "created",
            "updated",
            "added_photos"
        ],
        "route_configuration_types": [
            "edge",
            "pillar",
            "face",
            "corridor",
            "goulotte",
            "glacier"
        ],
        "image_categories": [
            "landscapes",
            "detail",
            "action",
            "track",
            "rise",
            "descent",
            "topo",
            "people",
            "fauna",
            "flora",
            "nivology",
            "geology",
            "hut",
            "equipment",
            "book",
            "help",
            "misc"
        ],
        "climbing_outdoor_types": [
            "single",
            "multi",
            "bloc",
            "psicobloc"
        ],
        "quality_types": [
            "empty",
            "draft",
            "medium",
            "fine",
            "great"
        ],
        "route_types": [
            "return_same_way",
            "loop",
            "loop_hut",
            "traverse",
            "raid",
            "expedition"
        ],
        "access_times": [
            "1min",
            "5min",
            "10min",
            "15min",
            "20min",
            "30min",
            "45min",
            "1h",
            "1h30",
            "2h",
            "2h30",
            "3h",
            "3h+"
        ],
        "lift_status": [
            "open",
            "closed"
        ],
        "mtb_up_ratings": [
            "M1",
            "M2",
            "M3",
            "M4",
            "M5"
        ],
        "engagement_ratings": [
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI"
        ],
        "frequentation_types": [
            "quiet",
            "some",
            "crowded",
            "overcrowded"
        ],
        "parking_fee_types": [
            "yes",
            "seasonal",
            "no"
        ],
        "product_types": [
            "farm_sale",
            "restaurant",
            "grocery",
            "bar",
            "sport_shop"
        ],
        "event_types": [
            "avalanche",
            "stone_fall",
            "falling_ice",
            "person_fall",
            "crevasse_fall",
            "roped_fall",
            "physical_failure",
            "lightning",
            "other"
        ],
        "avalanche_levels": [
            "level_1",
            "level_2",
            "level_3",
            "level_4",
            "level_5",
            "level_na"
        ],
        "public_transportation_types": [
            "train",
            "bus",
            "service_on_demand",
            "boat",
            "cable_car"
        ],
        "previous_injuries": [
            "no",
            "previous_injuries_2",
            "previous_injuries_3"
        ],
        "mtb_down_ratings": [
            "V1",
            "V2",
            "V3",
            "V4",
            "V5"
        ],
        "ski_ratings": [
            "1.1",
            "1.2",
            "1.3",
            "2.1",
            "2.2",
            "2.3",
            "3.1",
            "3.2",
            "3.3",
            "4.1",
            "4.2",
            "4.3",
            "5.1",
            "5.2",
            "5.3",
            "5.4",
            "5.5",
            "5.6"
        ],
        "snow_clearance_ratings": [
            "often",
            "sometimes",
            "progressive",
            "naturally",
            "closed_in_winter",
            "non_applicable"
        ],
        "glacier_gear_types": [
            "no",
            "glacier_safety_gear",
            "crampons_spring",
            "crampons_req",
            "glacier_crampons"
        ],
        "waypoint_types": [
            "summit",
            "pass",
            "lake",
            "waterfall",
            "locality",
            "bisse",
            "canyon",
            "access",
            "climbing_outdoor",
            "climbing_indoor",
            "hut",
            "gite",
            "shelter",
            "bivouac",
            "camp_site",
            "base_camp",
            "local_product",
            "paragliding_takeoff",
            "paragliding_landing",
            "cave",
            "waterpoint",
            "weather_station",
            "webcam",
            "virtual",
            "slackline_spot",
            "misc"
        ],
        "activity_rates": [
            "activity_rate_150",
            "activity_rate_50",
            "activity_rate_30",
            "activity_rate_20",
            "activity_rate_10",
            "activity_rate_5",
            "activity_rate_1"
        ],
        "climbing_ratings": [
            "2",
            "3a",
            "3b",
            "3c",
            "4a",
            "4b",
            "4c",
            "5a",
            "5a+",
            "5b",
            "5b+",
            "5c",
            "5c+",
            "6a",
            "6a+",
            "6b",
            "6b+",
            "6c",
            "6c+",
            "7a",
            "7a+",
            "7b",
            "7b+",
            "7c",
            "7c+",
            "8a",
            "8a+",
            "8b",
            "8b+",
            "8c",
            "8c+",
            "9a",
            "9a+",
            "9b",
            "9b+",
            "9c",
            "9c+"
        ],
        "paragliding_ratings": [
            "1",
            "2",
            "3",
            "4",
            "5"
        ],
        "climbing_indoor_types": [
            "pitch",
            "bloc"
        ],
        "ice_ratings": [
            "1",
            "2",
            "3",
            "3+",
            "4",
            "4+",
            "5",
            "5+",
            "6",
            "6+",
            "7",
            "7+"
        ]
    }
};
})