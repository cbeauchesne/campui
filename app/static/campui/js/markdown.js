

app = angular.module('campui')

        
// your new best friends :
// https://regex101.com/
// http://localhost:3000/markdown
        
app.provider('markdownConverter', [function () {
    "use strict";

    var ltag_memory = {L : 0, R:0}

    var opts = {
        simpleLineBreaks : true,
        headerLevelStart : 2,
        simplifiedAutoLink: true,
        extensions : ['c2c_folies'],
        };

    var c2c_folies = function () {

        function typo_tag(tag, html){
            return {
                type: 'lang',
                regex: new RegExp('\\[' + tag + '\\](.*?)\\[\\/' + tag + '\\]', 'g'),
                replace: function (match, text) {
                    return '<' + html + '>'+ text + '</' + html + '>';
                }
            };
        }

        var quote = typo_tag('q', 'q')
        var underline = typo_tag('u', 'u')
        var del = typo_tag('s', 'del')
        var sup = typo_tag('sup', 'sup')
        var sub = typo_tag('ind', 'sub')
        var italic = typo_tag('i', 'i')
        var bold = typo_tag('b', 'strong')
        var monospace = typo_tag('c', 'span') //not yet style...

        var typos = [quote, underline, del, sup, sub, italic, bold, monospace]

        var toc = { //trash
            type: 'lang',
            regex: /(\[\/?(toc2|p|col|toc|picto)([a-zA-Z_\d ]*)?\/?\])/g,
            replace: function () {
                return '';
            }
        };

        var color = { //trash
            type: 'lang',
            regex: /(\[\/?(color)(=#?[a-zA-Z_\d]*)?\/?\])/g,
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

        var code = {
            type: 'lang',
            regex: /\[code\]([^]*?)\[\/code\]/g,
            replace: function (match, text) {
                return '<pre>'+ text.replace(/\n([^ \n])/g,"\n $1") + '</pre>';
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
            var size = "MI"
            var css = []

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

            if(imgId.startsWith("picto/"))
                return '<img src="/static/campui/img/' + imgId + '"/>'
            else
                return '<figure' + css + '>' +
                    '<img src="https://api.camptocamp.org/images/proxy/' + imgId + '?size=' + size + '" ' +
                    'href="photoswipe.showGallery(' + imgId + ')"' +
                    '/></figure>'

        }

        var img = {
            type: 'lang',
            regex: /\[img=([\d]+|[A-Za-z][\dA-Za-z\._/]+)([a-zA-Z\-_ ]*)?\/\]/g,
            replace: function (match, imgId, options) {
                return image(imgId, options)
            }
        };

        var imgLegend = {
            type: 'lang',
            regex: /\[img=([\d]+|[A-Za-z][\dA-Za-z\._/]+)([a-zA-Z\-_ ]*)?\]([^\[]*)\[\/img\]/g,
            replace: function (match, imgId, options, legend) {
                return image(imgId, options, legend)
            }
        };

        var acr = {
            type: 'lang',
            regex: /\[acr(?:onym)?=([^\[]*?)\](.*?)\[\/acr(?:onym)?\]/g,
            replace: function (match, title, text) {
                return '<acronym title="' + title + '">' + text + '</acronym>';
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

        var LtagResult = function(){
            var _this = this

            this.rows = []
            this.cellCount = 1

            this.compute = function(separator){
                var items = ['\n<table>']

                this.rows.forEach(function(row){

                    items.push("<tr>")

                    if(row.cells){
                        while(row.cells.length < _this.cellCount-1)
                            row.cells.push("")

                        var elt_in = "<" + row.elt + ">"
                        var elt_out = "</" + row.elt + ">"

                        items.push(elt_in, row.cell1.trim(), elt_out)

                        row.cells.forEach(function(cell){
                            items.push(elt_in, cell.replace("\n", "<br>"), elt_out)
                        })
                    }
                    else{
                        items.push("<td colspan='" + _this.cellCount + "'>" + row.cell1 + "</td>")
                    }

                    items.push("</tr>")

                })

                items.push('</table>')
                return items.join("")
            }

            this.pushLine = function(elt, cell1, cells){

                //remove last empty cells
                if(cells && cells.length){

                    while(!cells[cells.length-1] && cells.length>0)
                        cells.splice(-1,1)

                    this.cellCount = Math.max(this.cellCount, cells.length + 1)
                }

                _this.rows.push({
                    elt:elt,
                    cell1:cell1,
                    cells:cells
                })
            }
        }

        var ltag = {
            type: 'lang',
            regex: /(?:(?:\n\n?)[LR]#[^]*?(?=\n[LR]#|\n\n))+/gm,
            replace: function () {
                arguments[0] = arguments[0] + "\n\n"
                
                var row_parser = /(?:\n\n?)([LR])#([^]*?(?=\n[LR]#|\n\n))/gm
                var row_sub_parser = /(=|~|[^|: =]*) *(\|\||\||::|:)?([^]*)/
                var cell_parser = /([^]*?)(?:\|+|::+)/g

                var result = new LtagResult()
                
                do{
                    var row_match = row_parser.exec(arguments[0])
                    
                    if(row_match){
                        var tag = row_match[1]
                        var row_parts = row_sub_parser.exec(row_match[2])
                        var suffix = row_parts[1]
                        var cells_str = row_parts[3]

                        cells_str = cells_str.trim() + "|"
                        var cells = []
                        
                        do{
                            var cell_match = cell_parser.exec(cells_str)
                            if(cell_match)
                                cells.push(cell_match[1].trim())
                            
                        }while(cell_match)
                        
                        processCells(result, tag, suffix, cells)
                    }                        
                } while(row_match)

                return result.compute()
            }
        }

        var processCells = function(result, tag, suffix, cells){

            if(suffix.startsWith("~"))
                result.pushLine('td', cells[0])
            else if(suffix.startsWith("="))                        
                result.pushLine('th', "", cells)
            else{                        
                
                var suffix_parser = /^(\+[\d]*|[\d]+)?(\-\+?[\d]+)?([^\d\-+!][^ !]*)?(!)?$/
                var suffix_data = suffix_parser.exec(suffix)

                if(suffix_data){
                    var fixed_number = suffix_data[1]   // <number> or +<number>
                    var group_number = suffix_data[2]   // -<+>?<number>
                    var label = suffix_data[3]          // whatever without spaces, and not starting with number nor  _-+!
                    var localRef = suffix_data[4]      // !

                    if(label){

                        if(label=="_")
                            delete ltag_memory.localRef

                        if(label != ltag_memory.current_postfix && label!="_"){

                            if(fixed_number=="+")
                                ltag_memory[tag]["_"]+=1

                            if(ltag_memory.localRef)
                                ltag_memory[tag][label] = ltag_memory.localRef -1
                            else
                                ltag_memory[tag][label] = (ltag_memory[tag]["_"]) - 1
                        }

                        ltag_memory.current_postfix = label //save bis pitch's label
                    }
                    else
                        label = ltag_memory.current_postfix

                    var number = ltag_memory[tag][label]

                    /////////////////////////////////////////////////////////////////////////////////////////////
                    // <number> or +<number>
                    // nothing, + or +1 means the same
                    if (!fixed_number || fixed_number == "+" || fixed_number =="+1") //+1
                        number += 1
                    else if (fixed_number.startsWith("+")) //only +N  : add N
                        number += parseInt(fixed_number)
                    else   //  number : set to it
                        number = parseInt(fixed_number)

                    var number2 = number

                    if(group_number){    // several pitchs on one row
                        group_number = group_number.substring(1)                         
                         if (group_number.startsWith("+"))
                            number2 = number + parseInt(group_number)
                        else 
                            number2 = parseInt(group_number)
                    }


                    //build final label
                    var cell1 = tag + number + (number2 != number ? "-" + number2 : "") + (label != "_" ? label : "")

                    result.pushLine('td', cell1, cells)

                    ltag_memory[tag][label] = number2

                    if(localRef)
                        ltag_memory.localRef = number2
                                       /*
                    cells = cells.map(function(cell){
                        return cell.replace(/([LR])#(_)?(\+[\d]*|[\d]+)?(\-\+?[\d]+)?(!)?/g,
                            function(match, tag, restartMainNumbering, fixedNumber, groupNumber,  localRef){

                                //tag                  ([LR])
                                //restartMainNumbering (_)?
                                //fixedNumber          (\+[\d]*|[\d]+)?
                                //groupNumber          (\-\+?[\d]+)?
                                //localRef             (!)?
                                console.log([match, tag, restartMainNumbering, fixedNumber, groupNumber, label, localRef])
                                return "{" + match + "}"
                            }
                        )
                    })
                    */

                }
            }                    
        }

        var video = {
            type: 'lang',
            regex: /\[video\](.*?)\[\/video\]/g,
            replace: function (match, url) {
                console.log(match)
                if(url.includes("vimeo.com")){
                    url = url.replace("vimeo.com","player.vimeo.com/video")
                    return '<iframe src="' + url + '" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
                }

                return match
            }
        };

        return [].concat(typos, [code, color, c2c_title, video,
            warning, imp, img, imgLegend, acr, url, url2, c2cItem, url4, url5, toc, ltag]);
    }

    showdown.extension('c2c_folies', c2c_folies);

    return {
        $get: function () {

            return function(code, $sanitize){
                ltag_memory.current_postfix = "_"
                ltag_memory.localRef = undefined

                ltag_memory.R = {"_":0}
                ltag_memory.L = {"_":0}

                var html = ""

                if(code){
                    html = (new showdown.Converter(opts)).makeHtml(code.replace("iframe", ""))

                    var IFRAME_IN = '<img alt="iframe" '
                    var IFRAME_OUT = '>___IFRAME_OUT__'

                    html = html.replace("<iframe ", IFRAME_IN)
                    html = html.replace("></iframe>", IFRAME_OUT)

                    html = $sanitize(html);

                    html = html.replace(IFRAME_IN, "<iframe ")
                    html = html.replace(IFRAME_OUT, "></iframe>")

                    html = html.replace(/href=.photoswipe/g, 'ng-click="photoswipe')

                }

                return html;
            }
        }
    };
}])

app.directive('markdown', ['$sanitize', 'markdownConverter', '$compile', function ($sanitize, markdownConverter, $compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            if(attrs.markdown)
                scope.$watch(attrs.markdown, function (newVal) {
                      element.append(markdownConverter(newVal, $sanitize));
                      $compile(element.contents())(scope);
                });
            else{
                var html = markdownConverter(element.text(), $sanitize);
                element.html(html)
            }
        },
    };
}])
