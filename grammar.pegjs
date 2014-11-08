{
    function filterNull(arr) {
        return arr.filter(function (item) { return item !== null });
    }
}

start
    = blocks:(targetBlock / blankLine)+

targetBlock
    = target:targetLine actions:(actionLine / blankLine)*
    { return { target: target, actions: filterNull(actions) } }
    

targetLine
    = file:filename ":" deps:(filename / " ")* EOL
    { return {
        file: file,
        dependencies: deps.filter(function (d) { return d.trim() !== '' }) } } 

actionLine
    = indent:INDENT action:(NEOL+) EOL
    { return action.join('') }

dependencies
    = .* 

colon
    = ":"

whitespace
    = [ \t]*

filename
    = c:([A-Za-z.]+)
    { return c.join('') }

//targetBlock
//    = target:targetLine action:actionLine+
//    { return { target: target, actions: action } }
//
//filename
//    = letters:[^ \t:]+
//    { return letters.join(""); }
//
//targetLine
//    = !EOL line:(.+) EOL
//    { return { target: line } }
//
//actionLine
//    = !EOL " "+ line:( c:. { return c; })+ EOL?
//    { return { action: line.join('') }; }

blankLine
    = EOL
    { return null }

EOL
    = "\r\n" / "\n" / "\r"

NEOL
    = [^\r\n]

INDENT
    = indent:[ \t]+
    { return indent.join('') }

