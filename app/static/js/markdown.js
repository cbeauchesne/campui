
app = angular.module('campui')

ltag_memory = {L : 0, R:0}
        
// your new best friends :
// https://regex101.com/
// http://localhost:3000/markdown
        
app.provider('markdownConverter', function () {
    var opts = {
        simpleLineBreaks : true,
        headerLevelStart : 2,
        simplifiedAutoLink: true,
        extensions : ['c2c_folies'],
        };

    var c2c_folies = function () {
        
        var toc = {
            type: 'lang',
            regex: /\[toc2( right)?\]/g,
            replace: function () {
                return '';
            }
        };
        
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

        // your new best friends :
        // https://regex101.com/
        // http://localhost:3000/markdown
        // http://localhost:3000/route/57964 thank you Mister Piola for this never ending multi pitch!
        
        var ltag = {
            type: 'lang',
            regex: /(?:(?:\n\n?)[LR]#[^]*?(?=\n[LR]#|\n\n))+/gm,
            replace: function () {
                arguments[0] = arguments[0] + "\n\n"
                
                row_parser = /(?:\n\n?)([LR])#([^]*?(?=\n[LR]#|\n\n))/gm
                suffix_parser = /^(_)?(\+[\d]*|[\d]+)?(\-\+?[\d]+)?([^\d\-+!][^ !]*)?(!)?$/
                cell_parser = /\|([^|]*)/g
                
                result = ['<table>']
                
                do{
                    row_match = row_parser.exec(arguments[0])
                    
                    if(row_match){
                        tag = row_match[1]
                        cells_str = "|" + row_match[2]                        
                        suffix =  cell_parser.exec(cells_str)[1].trim()
                        
                        cells = [] 
                        
                        do{
                            cell_match = cell_parser.exec(cells_str)
                            if(cell_match)
                                cells.push(cell_match[1].trim())
                            
                        }while(cell_match)
                        
                        processCells(result, tag, suffix, cells)
                    }                        
                } while(row_match)
                
                result.push('</table>')
                
                return result.join("")
            }
        }
        
        var pushLine = function(result, elt, cell1, cells){                                    
            result.push("<tr>")    
            
            elt_in = "<" + elt + ">"
            elt_out = "</" + elt + ">"
            
            //remove last empty cells
            if(cells.length) 
                while(!cells[cells.length-1])
                    cells.splice(-1,1)
            
            result.push(elt_in, cell1, elt_out)
                
            cells.forEach(function(cell){
                result.push(elt_in, cell, elt_out)
            })
            
            result.push("</tr>")
        }
        
        var processCells = function(result, tag, suffix, cells){    
            if(suffix.startsWith("~"))
                result.push("<tr><td colspan='6'>" + suffix.substring(1) + "</td></tr>")
            else if(suffix.startsWith("="))                        
                pushLine(result, 'th', suffix.substring(1), cells)
            else{                        
                
                suffix_parser = /^(_)?(\+[\d]*|[\d]+)?(\-\+?[\d]+)?([^\d\-+!][^ !]*)?(!)?$/
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
                        ltag_memory[tag] = ltag_memory[tag + "_main_end"]            
                        ltag_memory.current_postfix  = ""
                        delete ltag_memory[tag + "_main_start"]
                        delete ltag_memory[tag + "_main_end"]
                    }                            
                    
                     
                    if(label){ // bis pitch called label                                 
                        if(label!=ltag_memory.current_postfix){ // new bis pitch
                            if(!ltag_memory[tag + "_main_start"]) // there is no local_ref : save start and end of main pitch  
                            {
                                // ternary operator is a dirty fix (fixed_number == "+" ? 1 : 0) 
                                // try this :
                                // L#       ->L1        Ok
                                // L#bis    ->L1bis     Ok
                                // L#_      ->L2        Ok
                                // L#+left  ->L3left    Ok
                                // L#+tight ->L3right   Ok
                                // L#_      ->L4        Ok
                                // L#12bis  ->L12       Fail!
                                
                                ltag_memory[tag + "_main_start"] = ltag_memory[tag] + (fixed_number == "+" ? 1 : 0) 
                                ltag_memory[tag + "_main_end"] = ltag_memory[tag] + (fixed_number == "+" ? 1 : 0) 
                            } 
                            
                            ltag_memory[tag] = ltag_memory[tag + "_main_start"] - 1  // use start of main pitch
                        }
                        
                        ltag_memory.current_postfix = label //save bis pitch's label
                    }               
                    
                    /////////////////////////////////////////////////////////////////////////////////////////////
                    // <number> or +<number>
                    if(fixed_number){
                        if (fixed_number=="+") //only one '+' : add 1
                            ltag_memory[tag] += 1
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
                    //
                    /////////////////////////////////////////////////////////////////////////////////////////////
                    
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
                    cell1 = tag + ltag_memory[tag] + group_postfix + ltag_memory.current_postfix  
                    
                    if(group_number){ // if there is grup_number, we must add it to current ltag_memory
                         if (group_number.startsWith("+"))
                            ltag_memory[tag]+= parseInt(group_number) -1
                        else 
                            ltag_memory[tag] = parseInt(group_number)
                    }
                    
                    if(!ltag_memory.current_postfix) // means we are on main pitch                                
                        if(ltag_memory[tag + "_main_end"]) //and a local ref has been set, you must save end
                            ltag_memory[tag + "_main_end"] = ltag_memory[tag]
                            
                }
                else{
                    cell1 = tag + "#" + suffix
                }
                
                pushLine(result, 'td', cell1, cells)                       
            }                    
        }
        
        return [italic, bold, img, imgLegend, url, url2, c2cItem, toc, ltag];
    }

    showdown.extension('c2c_folies', c2c_folies);

    return {
        $get: function () {

            return function(code){
                ltag_memory.current_postfix = ""
                ltag_memory.R = 0
                ltag_memory.L = 0
                delete ltag_memory["R" + "_main_start"]
                delete ltag_memory["R" + "_main_end"]
                delete ltag_memory["L" + "_main_start"]
                delete ltag_memory["L" + "_main_end"]
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
