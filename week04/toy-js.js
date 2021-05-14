
var xregexp={
	main:/<Whitespace>|<LineTerminator>|<Comments>|<Token>/g,
	Whitespace:/ |\t/g,
	LineTerminator:/\r|\n/g,
	Comments:/\/\*([^\*]|[\*^\/])*\*\/|\/\/[^\r^\n]*/g,
	Token:/<Literal>|<Keywords>|<Identifer>|<Punctuator>/g,
	Literal:/<NumbericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>/g,
	NumbericLiteral:/([1-9][0-9]*|0)(\.[0-9]*)?|\.[0-9]+/g,
	BooleanLiteral:/true|false/g,
	StringLiteral:/\"(\\[\s\S]|[^\"\r\n])*\"|\'(\\[\s\S]|[^\'\r\n])*\'/g,
	NullLiteral:/null|NULL/g,
	Keywords:/if|else|for|while|do|continue|break|function|class/g,
	Identifer:/[a-zA-Z\$_][a-zA-Z\$_0-9]*/g,
	Punctuator:/\(|\)|\[|\]|\{|\}|\+|\=/g
};

function compileREG(xregexp, key) {
	var regexp;
	regexp=xregexp[key].source.replace(/<([^>]+)?>/g, function(str, $1) {
		return compileREG(xregexp, $1);
	});
	return regexp;
}

function scan(str) {
	//var reg=/ |\r|\n|\/\*([^\*]|[\*^\/])*\*\/|\/\/[^\r^\n]*|([1-9][0-9]*|0)(\.[0-9]*)?/g;
	var reg=new RegExp(compileREG(xregexp, "main"), "g");
	while(reg.lastIndex<str.length) {
		let res=reg.exec(str);
		if(!res) break;
		console.log(res[0]);
	}
}

var str=` 
	//你好*实得分*
	来了
	"的时间\\"弗兰克"
	'sdlfjlk \\' klsddsj '
	0000099.666
	0.7
	a$a1ggg
	ifelse
`;
console.log(str);
scan(str);





































