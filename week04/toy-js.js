
class Xregexp {
	constructor(xregexp) {
		this.xregexp=xregexp;
		this.index=0;
		this.map={};
		this.regexp=new RegExp(this.compileREG("main"), "g");
	}
	compileREG(key) {
		var that=this;
		var regexp;
		regexp=this.xregexp[key].source.replace(/<([^>]+)?>/g, function(str, $1) {
			var tmp=that.compileREG($1);
			return tmp;
		});
		if(regexp==this.xregexp[key].source) {
			that.map[that.index++]=key;
			return `(${regexp})`;
		}
		return regexp;
	}
	exec(str) {
		return this.regexp.exec(str);
	}
	lastIndex() {
		return this.regexp.lastIndex;
	}
}

var reg=new Xregexp({
	main:/<Whitespace>|<LineTerminator>|<Comments>|<Token>/g,
	Whitespace:/ |\t/g,
	LineTerminator:/\r|\n/g,
	Comments:/\/\*(?:[^\*]|[\*^\/])*\*\/|\/\/[^\r^\n]*/g,
	Token:/<Literal>|<Keywords>|<Identifer>|<Punctuator>/g,
	Literal:/<NumbericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>/g,
	NumbericLiteral:/(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/g,
	BooleanLiteral:/true|false/g,
	StringLiteral:/\"(?:\\[\s\S]|[^\"\r\n])*\"|\'(?:\\[\s\S]|[^\'\r\n])*\'/g,
	NullLiteral:/null|NULL/g,
	Keywords:/if|else|for|while|do|continue|break|function|class/g,
	Identifer:/[a-zA-Z\$_][a-zA-Z\$_0-9]*/g,
	Punctuator:/\(|\)|\[|\]|\{|\}|\+|\=/g
});
//reg.show();

/* function scan(str) {
	//var reg=/ |\r|\n|\/\*([^\*]|[\*^\/])*\*\/|\/\/[^\r^\n]*|([1-9][0-9]*|0)(\.[0-9]*)?/g;
	var reg=new RegExp(compileREG(xregexp, "main"), "g");
	while(reg.lastIndex<str.length) {
		let res=reg.exec(str);
		if(!res) break;
		console.log(res[0]);
	}
}*/

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
while(reg.lastIndex()<str.length) {
	var res=reg.exec(str);
	if(!res) break;
	for(var i=1; i<res.length; i++)
		if(res[i]) console.log(reg.map[i-1]);
	console.log(JSON.stringify(res[0]));
}





































