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
                name : "test",
                document_id : 884062
            }
        ]
    }
}