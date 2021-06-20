
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

function* scan(str) {
	var reg=new Xregexp({
		main:/<Whitespace>|<LineTerminator>|<Comments>|<Token>/g,
		Whitespace:/ |\t/g,
		LineTerminator:/\r|\n/g,
		Comments:/\/\*(?:[^\*]|[\*^\/])*\*\/|\/\/[^\r^\n]*/g,
		Token:/<Literal>|<Keywords>|<Identifier>|<Punctuator>/g,
		Literal:/<NumbericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>/g,
		NumbericLiteral:/(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/g,
		BooleanLiteral:/true|false/g,
		StringLiteral:/\"(?:\\[\s\S]|[^\"\r\n])*\"|\'(?:\\[\s\S]|[^\'\r\n])*\'/g,
		NullLiteral:/null/g,
		Keywords:/var|let|if|else|for|while|do|continue|break|function|class/g,
		Identifier:/[a-zA-Z\$_][a-zA-Z\$_0-9]*/g,
		Punctuator:/\(|\)|\[|\]|\{|\}|\+|\=|;|\./g
	});

	while(reg.lastIndex()<str.length) {
		var res=reg.exec(str);
		if(!res) break;
		var value="";
		for(var i=1; i<res.length; i++)
			if(res[i]) {
				value=reg.map[i-1];
				break;
			}
		var type=res[0];
		//console.log(type, value);
		if(value=="LineTerminator");
		else if(value=="Comments");
		else if(value=="Whitespace");
		else if(
			value=="NumbericLiteral" ||
			value=="BooleanLiteral" ||
			value=="StringLiteral" ||
			value=="Keywords" ||
			value=="Punctuator"
		)	yield {
				type:type,
				//value:value
			}
		else if(value=="Identifier")
			yield {
				type:"Identifier",
				name:type
			}
		else if(value=="NullLiteral")
			yield {
				type:type,
				value:null
			}
		else throw new Error("无效token");
		if(!value.length) break;
	}
	yield {type:"EOF"}
}

exports.scan=scan;




































