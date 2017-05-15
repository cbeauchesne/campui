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
                name : "Actualités",
                document_id : 884062
            },
            {
                name : "Grandes courses",
                document_id : 812616
            },
            {
                name : "Terrain d'aventure",
                document_id : 812612
            },
            {
                name : "Raids et expéditions",
                document_id : 289804
            },
            {
                name : "Cascade de glace",
                document_id : 812600
            },
            {
                name : "Changer d'approche",
                document_id : 219827
            },
            {
                name : "Pyrénées",
                document_id : 812611
            },
            {
                name : "Vosges",
                document_id : 339832
            }
        ]
    }
}