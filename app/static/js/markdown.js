
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
        var toc = { //trash
            type: 'lang',
            regex: /(\[\/?(toc2|p|col|toc|picto)([a-zA-Z_\d ]*)?\/?\])/g,
            replace: function () {
                return '';
            }
        };

        var c2c_title = { //trash
            type: 'lang',
            regex: /\n(#+)c?([^\n#]+)#*(.*)/g,
            replace: function (match, hashs, title, appendix) {
                if(appendix)
                    appendix = "<small>" + appendix + "</small>"

                return '\n' + hashs + title + appendix ;
            }
        };

        var underline = {
            type: 'lang',
            regex: /\[u\](.*?)\[\/u\]/g,
            replace: function (match, text) {
                return '<u>'+ text + '</u>';
            }
        };

        var del = {
            type: 'lang',
            regex: /\[s\](.*?)\[\/s\]/g,
            replace: function (match, text) {
                return '<del>'+ text + '</del>';
            }
        };

        var sup = {
            type: 'lang',
            regex: /\[sup\](.*?)\[\/sup\]/g,
            replace: function (match, text) {
                return '<sup>'+ text + '</sup>';
            }
        };

        var sub = {
            type: 'lang',
            regex: /\[ind\](.*?)\[\/ind\]/g,
            replace: function (match, text) {
                return '<sub>'+ text + '</sub>';
            }
        };

        var monospace = {
            type: 'lang',
            regex: /\[c\](.*?)\[\/c\]/g,
            replace: function (match, text) {
                return text;
            }
        };

        var italic = {
            type: 'lang',
            regex: /\[i\](.*?)\[\/i\]/g,
            replace: function (match, text) {
                return '<i>'+ text + '</i>';
            }
        };

        var code = {
            type: 'lang',
            regex: /\[code\]([^]*?)\[\/code\]/g,
            replace: function (match, text) {
                return '<pre>'+ text.replace(/\n([^ \n])/g,"\n $1") + '</pre>';
            }
        };

        var bold = {
            type: 'lang',
            regex: /\[b\]([^\]]*)\[\/b\]/g,
            replace: function (match, text) {
                return '<strong>'+ text + '</strong>';
            }
        };

        var imp = {
            type: 'lang',
            regex: /\[imp(?:ortant)?\]\n*([^]*?)\n*\[\/imp(?:ortant)?\]/g,
            replace: function (match, text) {
                return '<div class="alert alert-danger">'+ text.replace(/\n/g,"<br>") + '</div>';
            }
        };

        var warning = {
            type: 'lang',
            regex: /\[warning?\]\n*([^]*?)\n*\[\/warning?\]/g,
            replace: function (match, text) {
                return '<div class="alert alert-danger">'+ text.replace(/\n/g,"<br>") + '</div>';
            }
        };

        function image(imgId, options, legend){
            size = "MI"
            css = []

            if(options){
                options = options.split(" ")


                options.forEach(function(option){
                    if(option){
                        css.push('image-' + option.replace("_","-"))
                        size = option=="big" ? "BI" : size
                     }
                })
            }

            css = css.length ? " class='" + css.join(" ") + "'" : ""

            return '<figure' + css + '>' +
                '<a href="https://www.camptocamp.org/images/' + imgId + '" target="_blank">' +
                '<img src="https://api.camptocamp.org/images/proxy/' + imgId + '?size=' + size + '" />' +
                '</a>' +
                '</figure>'

        }

        var img = {
            type: 'lang',
            regex: /\[img=([\dA-Za-z\._/]+)( [a-zA-Z\-_ ]*)?\/\]/g,
            replace: function (match, imgId, options) {
                return image(imgId, options)
            }
        };

        var imgLegend = {
            type: 'lang',
            regex: /\[img=([\dA-Za-z\._/]+)( [a-zA-Z\-_ ]*)?\]([^\[]*)\[\/img\]/g,
            replace: function (match, imgId, options, legend) {
                return image(imgId, options, legend)
            }
        };

        var url = {
            type: 'lang',
            regex: /\[url=?\]([^\[]*)\[\/url\]/g,
            replace: function (match, url) {
                return '<a href="' + url + '">' + url + '</a>';
            }
        };

        var url2 = {
            type: 'lang',
            regex: /\[url=([^\]\n]+)\]([^\[]*)\[\/url\]/g,
            replace: function (match, url, text) {
                return '<a href="' + url + '">' + text + '</a>';
            }
        };

        var c2cItem = {
            type: 'lang',
            regex: /\[\[(book|waypoint|route|outing|area|article)s\/([\d]+)([^|]*)\|([^\]]*)\]\]/g,
            replace: function (match, item, id, lang, text) {
                if(item=="book" || item=="article")
                    return '<a href="https://www.camptocamp.org/' + item + 's/' + id + '">' + text + '</a>';
                else
                    return '<a href="' + item + '/' + id + '">' + text + '</a>';
            }
        };

        var url4 = {
            type: 'lang',
            regex: /\[\[([^|\n ]*)\|([^\]]*)\]\]/g,
            replace: function (match, url, text) {
                return '<a href="' + url + '">' + text + '</a>'; // give it to markdown
            }
        };

        var url5 = {
            type: 'lang',
            regex: /\[email\](.*?)\[\/email\]/g,
            replace: function (match, mail) {
                return '<a href="mailto:' + mail + '">' + mail + '</a>'; // give it to markdown
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
                row_sub_parser = /(=|~|[^|: =]*) *(\|\||\||::|:)?([^]*)/
             //   cell_parser = /([^|:]*)[|:]+/g
                cell_parser = /([^]*?)(?:\|+|::+)/g
                
                result = ['\n<table>']
                
                do{
                    row_match = row_parser.exec(arguments[0])
                    
                    if(row_match){

                        tag = row_match[1]
                        row_parts = row_sub_parser.exec(row_match[2])
                        suffix = row_parts[1]
                        cells_str = row_parts[3]

                        cells_str = cells_str.trim() + "|"
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
                while(!cells[cells.length-1] && cells.length>0)
                    cells.splice(-1,1)

            while(cells.length < ltag_memory.cellCount)
                cells.push("")

            result.push(elt_in, cell1.trim(), elt_out)
                
            cells.forEach(function(cell){
                result.push(elt_in, cell.replace("\n", "<br>"), elt_out)
            })
            
            result.push("</tr>")
        }
        
        var processCells = function(result, tag, suffix, cells){
            if(!ltag_memory.cellCount)
                ltag_memory.cellCount = cells.length

            if(suffix.startsWith("~"))
                result.push("<tr><td colspan='666'>" + cells[0] + "</td></tr>")
            else if(suffix.startsWith("="))                        
                pushLine(result, 'th', "", cells)
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

                        if(!label){
                            ltag_memory.current_postfix  = ""
                            delete ltag_memory[tag + "_main_start"]
                            delete ltag_memory[tag + "_main_end"]
                        }
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
        
        return [code, italic, bold, sup, sub, underline, monospace, del, c2c_title,
            warning, imp, img, imgLegend, url, url2, c2cItem, url4,url5, toc, ltag];
    }

    showdown.extension('c2c_folies', c2c_folies);

    return {
        $get: function () {

            return function(code){
                ltag_memory.current_postfix = ""
                ltag_memory.R = 0
                ltag_memory.L = 0
                delete ltag_memory.cellCount
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
