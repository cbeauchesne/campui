
app = angular.module('campui')

ltag_memory = {L : 0, R:0}
        
app.provider('markdownConverter', function () {
    var opts = {
        simpleLineBreaks : true,
        headerLevelStart : 2,
        simplifiedAutoLink: true,
        extensions : ['c2c_folies'],
        };

    var c2c_folies = function () {
        var italic = {
            type: 'lang',
            regex: /\[i\]([^\]]*)\[\/i\]/g,
            replace: function (match, text) {
                return '<i>'+ text + '</i>';
            }
        };

        var bold = {
            type: 'lang',
            regex: /\[b\]([^\]]*)\[\/b\]/g,
            replace: function (match, text) {
                return '<strong>'+ text + '</strong>';
            }
        };

        function image(imgId, size, position, legend){
            position = position ? position.trim() : ""
            size = size ? size.trim() : ""

            css = " "
            if(position) css+= ' image-' + position
            if(size) css+= ' image-' + size

            css=" class='" + css + "'"

            size = size =="big" ? "BI" : "MI"

            return '<figure' + css + '>' +
                '<a href="https://www.camptocamp.org/images/' + imgId + '" target="_blank">' +
                '<img src="https://api.camptocamp.org/images/proxy/' + imgId + '?size=' + size + '" />' +
                '</a>' +
                '</figure>'

        }

        var img = {
            type: 'lang',
            regex: /\[img=([\d]+)( big)?( right| center| left | inline)?( no_border)?( no_legend)? *\/\]/g,
            replace: function (match, imgId, size, position, border, legend) {
                return image(imgId, size, position, legend)
            }
        };

        var imgLegend = {
            type: 'lang',
            regex: /\[img=([\d]+)( big)?( right| center| left| inline)?\]([^\[]*)\[\/img\]/g,
            replace: function (match, imgId, size, position, legend) {
                return image(imgId, size, position, legend)
            }
        };

        var url = {
            type: 'lang',
            regex: /\[url\]([^\[]*)\[\/url\]/g,
            replace: function (match, url) {
                return '<a href="' + url + '">' + url + '</a>';
            }
        };

        var url2 = {
            type: 'lang',
            regex: /\[url=([^\]]+)\]([^\[]*)\[\/url\]/g,
            replace: function (match, url, text) {
                return '<a href="' + url + '">' + text + '</a>';
            }
        };

        var c2cItem = {
            type: 'lang',
            regex: /\[\[(book|waypoint|route)s\/([\d]+)([^|]*)\|([^\]]*)\]\]/g,
            replace: function (match, item, id, lang, text) {
                if(item=="book")
                    return '<a href="https://www.camptocamp.org/' + item + 's/' + id + '">' + text + '</a>';
                else
                    return '<a href="' + item + '/' + id + '">' + text + '</a>';
            }
        };

        line_count = 40

        content_pattern = "(?:[^]*?(?=\\n[LR]#|\\n\\n|\\|))"
        first_cellPattern = "(?:\\n)([LR])#(" + content_pattern + ")"
        cell_pattern = "(\\|" + content_pattern + ")?"

        row_pattern = "(" + first_cellPattern + cell_pattern + cell_pattern + cell_pattern + cell_pattern + cell_pattern + "\\|?)"

        pattern = row_pattern
        for(l=1;l<line_count;l++)
            pattern += row_pattern + "?"

        suffix_parser = /^(_)?(\+[\d]*|[\d]+)?(\-\+?[\d]+)?([^\d\-+!][^ !]*)?(!)?$/
        
        var ltag = {
            type: 'lang',
            regex: RegExp(pattern, 'gm'),
            replace: function () {
                result = ['<table>']
                                        
                pos = 2
                current_postfix = ""

                for(l=0;l<line_count;l++){
                    if(!arguments[pos]) //full line
                        break

                    tag = (arguments[pos] || "").trim()
                    suffix = (arguments[pos+1] || "").trim()
                    cotation = (arguments[pos+2] || "").trim().replace("|","")
                    length = (arguments[pos+3] || "").trim().replace("|","")
                    gears = (arguments[pos+4] || "").trim().replace("|","")
                    description = (arguments[pos+5] || "").trim().replace("|","")
                    belay = (arguments[pos+6] || "").trim().replace("|","")

                    if(suffix.startsWith("~"))
                        result.push("<tr><td colspan='6'>" + suffix.substring(1) + "</td></tr>")
                    else if(suffix.startsWith("=")){
                        
                        result.push("<tr>")
                        result.push("<th>" + suffix.substring(1) + "</th>")
                        result.push("<th>" + cotation + "</th>")
                        result.push("<th>" + length + "</th>")
                        result.push("<th>" + gears + "</th>")
                        result.push("<th>" + description + "</th>")
                        result.push("<th>" + belay + "</th>")
                        result.push("</tr>")
                        
                    }
                    else{
                        
                        console.log([suffix, suffix_parser.exec(suffix)])
                        
                        suffix_data = suffix_parser.exec(suffix)
                        if(suffix_data){
                            modifier = suffix_data[1]       // _ or =
                            fixed_number = suffix_data[2]   // <number> or +<number>
                            group_number = suffix_data[3]   // -<+>?<number>
                            label = suffix_data[4]          // whatever without spaces, and not starting with number nor  _-+!
                            local_ref = suffix_data[5]      // ! 
                             
                            // _ means kill any bis pitch and restart from main_end that contains last main pitch
                            // delete useless main_start and main_end
                            if(modifier=="_"){                                
                                current_postfix = ""
                                ltag_memory[tag] = ltag_memory[tag + "_main_end"] 
                                delete ltag_memory[tag + "_main_start"]
                                delete ltag_memory[tag + "_main_end"]
                            }                            
                            
                            // <number> or +<number>
                            if(fixed_number){
                                if (fixed_number=="+") //only one '+' : add 1
                                    ltag_memory[tag]++
                                else if (fixed_number.startsWith("+")) //only +N  : add N
                                    ltag_memory[tag]+= parseInt(fixed_number)
                                else   //  number : set to it
                                    ltag_memory[tag] = parseInt(fixed_number)
                            }
                            else // no specified number : add 1
                                ltag_memory[tag]++
                                                        
                            if(local_ref){  // set local ref for multi bis pitch : save start and end of main pitch                              
                                ltag_memory[tag + "_main_start"] = ltag_memory[tag]
                                ltag_memory[tag + "_main_end"] = ltag_memory[tag]
                            }
                                
                            if(label){ // bis pitch called label                                 
                                if(label!=current_postfix){ // new bis pitch
                                    if(!ltag_memory[tag + "_main_start"]) // there is no local_ref : save start and end of main pitch  
                                    {
                                        ltag_memory[tag + "_main_start"] = ltag_memory[tag] -1
                                        ltag_memory[tag + "_main_end"] = ltag_memory[tag] -1
                                    }
                                    
                                    ltag_memory[tag] = ltag_memory[tag + "_main_start"] // use start of main pitch
                                }
                                
                                current_postfix = label //save bis pitch's label
                            }                            
                                
                            
                            if(group_number){    // several pitchs on one row
                                group_number = group_number.substring(1)                         
                                 if (group_number.startsWith("+"))
                                    group_postfix = "-" + (ltag_memory[tag] + parseInt(group_number))
                                else 
                                    group_postfix = "-" + parseInt(group_number)
                                
                            }
                            else
                                group_postfix = ""
                        
                            //build final label
                            cell1 = tag + ltag_memory[tag] + group_postfix + current_postfix    
                            
                            if(group_number){ // if there is grup_number, we must add it to current ltag_memory
                                 if (group_number.startsWith("+"))
                                    ltag_memory[tag]+= parseInt(group_number) -1
                                else 
                                    ltag_memory[tag] = parseInt(group_number)
                            }
                            
                            if(!current_postfix) // means we are on main pitch                                
                                if(ltag_memory[tag + "_main_end"]) //and a local ref has been set, you must save end
                                    ltag_memory[tag + "_main_end"] = ltag_memory[tag]
                                    
                        }
                        else{
                            cell1 = tag + "#" + suffix
                        }
                        
                        result.push("<tr>")
                        result.push("<td>" + cell1 + "</td>")
                        result.push("<td>" + cotation + "</td>")
                        result.push("<td>" + length + "</td>")
                        result.push("<td>" + gears + "</td>")
                        result.push("<td>" + description + "</td>")
                        result.push("<td>" + belay + "</td>")
                        result.push("</tr>")
                    }
                    pos +=8

                }
                result.push("</table>")
                return result.join("");
            }
        };


        var toc = {
            type: 'lang',
            regex: /\[toc2( right)?\]/g,
            replace: function () {
                return '';
            }
        };

        return [italic, bold, img, imgLegend, url, url2, c2cItem, toc, ltag];
    }

    showdown.extension('c2c_folies', c2c_folies);

    return {
        $get: function () {

            return function(code){
                ltag_memory.R = 0
                ltag_memory.L = 0
                return (new showdown.Converter(opts)).makeHtml(code);
            }
        }
    };
})

app.directive('markdown', ['$sanitize', 'markdownConverter', function ($sanitize, markdownConverter) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (attrs.markdown) {
                scope.$watch(attrs.markdown, function (newVal) {
                    var html = newVal ? $sanitize(markdownConverter(newVal)) : '';
                    element.html(html);
                });
            } else {
                var html = $sanitize(markdownConverter(element.text()));
                element.html(html);
            }
        }
    };
}])
