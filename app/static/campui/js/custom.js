// here is the code to customize local version
// it's a plain javascript function that return an object
// please note that regarding long term devlopment, any angular relative logic won't be supported!
// so if you wan't to be sure that your customization be supported in next versions,
// keep it as a simple flat data
// ...
// but if you want to do it anyway, feel free unless you understand the consequences :-)


function campuiCustomization(){
    return {
        portals : [
            {
                name : "Portal/Cascade de glace",
                label : "Cascade de glace"

            },/*
            {
                name : "Actualités",
                template_article : 884062
            },
            {
                name : "Grandes courses",
                template_article : 884440
            },
            {
                name : "Terrain d'aventure",
                template_article : 884441
            },
            {
                name : "Raids et expéditions",
                template_article : 884442
            },
            {
                name : "Changer d'approche",
                template_article : 884444
            },
            {
                name : "Pyrénées",
                template_article : 884445
            },
            {
                name : "Vosges",
                template_article : 884446
            }*/
        ]
    }
}
