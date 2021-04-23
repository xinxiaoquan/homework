var cssParser=require("css");

//响应报文解析类
class ResponseParser {
	constructor() {
		this.line="";
		this.statusCode="";
		this.statusText="";
		this.headers={};
		this.headerKey="";
		this.headerValue="";
		this.body="";
		this.parserBody=null;
		this.RES_LINE=0;
		this.RES_LINE_STATUS_CODE=0x10;
		this.RES_LINE_STATUS_TEXT=0x11;
		this.RES_HEADER=1;
		this.RES_HEADRE_SPACE=10;
		this.RES_HEADRE_VALUE=11;
		this.RES_HEADRE_END=12;
		this.RES_BODY=2;
		this.STATUS=this.RES_LINE;
	}
	receive(string) {
		for(let i=0; i<string.length; i++)
			this.receiveChar(string[i]);
		if(this.parserBody)
			this.body=this.parserBody.body;
		return {
			line:this.line,
			statusCode:this.statusCode,
			statusText:this.statusText,
			headers:this.headers,
			body:this.body
		};
	}
	receiveChar(c) {
		if(c=="\r") return;
		if(this.STATUS==this.RES_LINE) {
			if(c=="\n") {
				this.STATUS=this.RES_HEADRE_END;
				return;
			}
			this.line+=c;
			if(c==" ") {
				this.STATUS=this.RES_LINE_STATUS_CODE;
				return;
			}
		}
		if(this.STATUS==this.RES_LINE_STATUS_CODE) {
			this.line+=c;
			if(c==" ") {
				this.STATUS=this.RES_LINE_STATUS_TEXT;
				return;
			}
			this.statusCode+=c;
		}
		if(this.STATUS==this.RES_LINE_STATUS_TEXT) {
			if(c=="\n") {
				this.STATUS=this.RES_HEADRE_END;
				return;
			}
			this.line+=c;
			this.statusText+=c;
		}
		if(this.STATUS==this.RES_HEADER) {
			if(c=="\n") {
				this.STATUS=this.RES_HEADRE_END;
				return;
			}
			if(c==":") {
				this.STATUS=this.RES_HEADRE_SPACE;
				return;
			}
			this.headerKey+=c;
		}
		if(this.STATUS==this.RES_HEADRE_END) {
			if(c=="\n") {
				this.STATUS=this.RES_BODY;
				if(this.headers["Transfer-Encoding"]=="chunked")
					this.parserBody=new ResponseBodyParser();
				return;
			}
			this.headerKey+=c;
			this.STATUS=this.RES_HEADER;
		}
		if(this.STATUS==this.RES_HEADRE_SPACE) {
			if(c!=" ") {
				this.STATUS=this.RES_HEADER_VALUE;
				this.headerValue+=c;
				return;
			}
		}
		if(this.STATUS==this.RES_HEADER_VALUE) {
			if(c=="\n") {
				this.STATUS=this.RES_HEADRE_END;
				this.headers[this.headerKey]=this.headerValue;
				this.headerKey=this.headerValue="";
				return;
			}
			this.headerValue+=c;
		}
		if(this.STATUS==this.RES_BODY)
			if(this.parserBody)
				this.parserBody.receiveChar(c);
	}
}

//响应主体内容解析类
class ResponseBodyParser {
	constructor() {
		this.length="";
		this.body="";
		this.START_LINE=0;
		this.BODY_CONTENT=1;
		this.END=2;
		this.STATUS=this.START_LINE;
	}
	receiveChar(c) {
		if(c=="\r") return;
		if(this.STATUS==this.START_LINE) {
			if(c=="\n") {
				this.STATUS=this.BODY_CONTENT;
				this.length=parseInt(this.length, 16);
				if(this.length==0)
					this.STATUS=this.END;
				return;
			}
			this.length+=c;
		}
		if(this.STATUS==this.BODY_CONTENT) {
			this.body+=c;
			this.length=this.length-this.getByte(c);
			if(this.length==0) {
				this.STATUS=this.END;
				return;
			}
		}
	}
	//解析一个字符占多少字节
	getByte(c) {
		if(c.charCodeAt(0)<=0x007f) return 1;
		if(c.charCodeAt(0)<=0x07ff) return 2;
		if(c.charCodeAt(0)<=0xffff) return 3;
		return 4;
	}
}

//html数据解析类（解析为DOM）
class HtmlParser {
	constructor() {
		//空白字符合集
		this.spaceChar=["\r","\n","\t"," ","\f"];
		//错误代码合集
		this.errCode={
			ERRER01:"结束标签有不合法的空白字符！",
			ERRER04:"标签后不能紧跟非法的空白字符！",
			ERRER05:"自封闭标签未结束！",
			ERRER06:"标签名只能是字母！",
			ERRER08:"属性键值错误！",
			ERRER09:"属性值是非法的空白字符！",
		}
		//临时存储节点
		this.currentToken={};
		//临时存储HTML属性
		this.attrKeyData="";
		//临时存储HTML属性值
		this.attrValueData="";
		//存储的dom树
		this.domTree={type:"document", children:[], parent:null};
		//用于处理dom结构的栈
		this.domStack=[this.domTree];
		//存储CSS规则
		this.cssRules=[];
		this.EOF=Symbol("EOF");
		this.data=function(c) {
			if(c=="<") {
				this.currentToken.type="startTag";
				return this.tagStart;
			}
			if(c==this.EOF)
				return this.end;
			this.currentToken.type="text";
			return this.textNode(c);
		}
		this.textNode=function(c) {
			if(c=="<") {
				this.nodeToDom();
				return this.data(c);
			}
			if(!this.currentToken.content)
				this.currentToken.content="";
			this.currentToken.content+=c;
			return this.textNode;
		}
		this.tagStart=function(c) {
			if(this.isSpace(c))
				return this.err(this.returnErr("ERRER04"));
			if(c=="/") {
				this.currentToken.type="endTag";
				return this.endTag;
			}
			if(this.isChar(c))
				return this.tagName(c);
			return this.err(this.returnErr("ERRER06"));
		}
		//结束标签状态
		this.endTag=function(c) {
			if(this.isSpace(c))
				return this.err(this.returnErr("ERRER01"));
			if(c==">") {
				this.nodeToDom();
				return this.data;
			}
			if(this.isChar(c)) {
				if(!this.currentToken.tagName)
					this.currentToken.tagName="";
				this.currentToken.tagName+=c;
				return this.endTag;
			}
			return this.err(this.returnErr("ERRER06"));
		}
		this.tagName=function(c) {
			if(this.isSpace(c))
				return this.attrKeyStart;
			if(c==">") {
				this.nodeToDom();
				return this.data;
			}
			if(c=="/") {
				this.currentToken.type="selfColseTag";
				return this.selfColseTag;
			}
			if(this.isChar(c)) {
				if(!this.currentToken.tagName)
					this.currentToken.tagName="";
				this.currentToken.tagName+=c;
				return this.tagName;
			}
			return this.err(this.returnErr("ERRER06"));
		}
		//自封闭标签状态
		this.selfColseTag=function(c) {
			if(c==">") {
				this.nodeToDom();
				return this.data;
			}
			return this.err(this.returnErr("ERRER05"));
		}
		this.attrKeyStart=function(c) {
			if(this.isSpace(c))
				return this.attrKeyStart;
			if(c=="=")
				return this.err(this.returnErr("ERRER08"));
			return this.attrKey(c);
		}
		this.attrKey=function(c) {
			if(this.isSpace(c))
				return this.attrKeyStart;
			if(c==">" || c=="/") return this.tagName(c);
			if(c=="=")
				return this.attrValueStart;
			this.attrKeyData+=c;
			return this.attrKey;
		}
		this.attrValueStart=function(c) {
			if(this.isSpace(c))
				return this.err(this.returnErr("ERRER09"));
			if(c=="\"")
				return this.DQAttrValue;
			if(c=="'")
				return this.SQAttrValue;
			return this.attrValue(c);
		}
		this.attrValue=function(c) {
			if(this.isSpace(c)) {
				this.endAttrValue();
				return this.attrKeyStart;
			}
			if(c==">" || c=="/") {
				this.endAttrValue();
				return this.tagName(c);
			}
			this.attrValueData+=c;
			return this.attrValue;
		}
		this.DQAttrValue=function(c) {
			if(c=="\"") {
				this.endAttrValue();
				return this.attrKeyStart;
			}
			this.attrValueData+=c;
			return this.DQAttrValue;
		}
		this.SQAttrValue=function(c) {
			if(c=="'") {
				this.endAttrValue();
				return this.attrKeyStart;
			}
			this.attrValueData+=c;
			return this.SQAttrValue;
		}
		//结束属性值操作
		this.endAttrValue=function() {
			this.currentToken[this.attrKeyData]
				=this.attrValueData;
			this.attrKeyData="";
			this.attrValueData="";
		}
		this.err=function(mess) {
			console.log(mess);
			return this.end;
		}
		this.end=function(c) {
			return this.end;
		}
		this.status=this.data;
	}
	//解析html数据传入的入口
	parserHtml(string) {
		for(var i=0; i<string.length; i++)
			this.status=this.status(string[i]);
		//console.log(this.domTree);
	}
	//把分析后的节点转为dom
	nodeToDom() {
		var currentToken=this.currentToken;
		this.currentToken={};
		var newDom={};
		var stackTop=this.domStack[this.domStack.length-1];
		if(currentToken.type=="endTag") {
			if(currentToken.tagName!=stackTop.tagName)
				throw new Error("解析错误！未找到结束标签");
			this.domStack.length--;
			if(currentToken.tagName=="style")
				this.saveCssRules(stackTop.children[0].content);
			return;
		}
		for(var key in currentToken) {
			if(key=="type") {
				if(currentToken[key]=="startTag" ||
					currentToken[key]=="selfColseTag")
					newDom.type="element";
				else newDom.type=currentToken[key];
				continue;
			}
			if(key=="tagName"||key=="content") {
				newDom[key]=currentToken[key];
				continue;
			}
			if(!newDom.attrs)
				newDom.attrs={};
			newDom.attrs[key]=currentToken[key];
		}
		if(!stackTop.children)
			stackTop.children=[];
		stackTop.children.push(newDom);
		newDom.parent=stackTop;
		if(currentToken.type!="text")
			this.cssComputing(newDom);
		if(currentToken.type=="startTag")
			this.domStack.push(newDom);
	}
	//解析存储CSS属性
	saveCssRules(data) {
		var rules=cssParser.parse(data).stylesheet.rules;
		for(var i=0; i<rules.length; i++) {
			let selectors=rules[i].selectors;
			let declarations=rules[i].declarations;
			let tmp={};
			for(var j=0; j<declarations.length; j++) {
				let key=declarations[j].property;
				let value=declarations[j].value;
				tmp[key]=value;
			}
			this.cssRules.push({
				selectors:selectors,
				declarations:tmp
			});
		}
		//console.log(this.cssRules);
	}
	//CSS计算，匹配元素
	cssComputing(elem) {
		var parents=this.domStack.slice().reverse();
		for(var i=0; i<this.cssRules.length; i++) {
			let selectors=this.cssRules[i].selectors;	
			let declarations=this.cssRules[i].declarations;
			for(var j=0; j<selectors.length; j++) {
				let selector=selectors[j];
				selector=selector.split(/\s+/).reverse();
				let isMatch=false;
				if(selector.length>parents.length+1)
					continue;
				if(!this.cssMatchDom(elem, selector[0]))
					continue;
				for(var k=0,w=1; k<parents.length; k++) {
					if(this.cssMatchDom(parents[k], selector[w]))
						w++;
					//	else break;
					if(w==selector.length) {
						isMatch=true;
						break;
					}
				}
				if(isMatch)
					console.log(selector.reverse().join(" "), "匹配到了！");
			}
		}
	}
	//CSS选择器匹配元素
	cssMatchDom(elem, selector) {
		if(!selector || !elem.attrs)
			return false;
		if(selector.charAt(0)=="#") {
			selector=selector.slice(1);
			if(elem.attrs.id &&
					elem.attrs.id==selector)
				return true;
			else return false;
		}
		if(selector.charAt(0)==".") {
			selector=selector.slice(1);
			if(elem.attrs["class"] &&
					elem.attrs["class"].indexOf(selector)!=-1)
				return true;
			else return false;
		}
		if(selector.charAt(0)=="[") {
			selector=selector.slice(1,-1);
			var tmp=selector.split("=");
			if(tmp[0]=="class")
				return this.cssMatchDom(elem, "."+tmp[1]);
			if(tmp[0]=="id")
				return this.cssMatchDom(elem, "#"+tmp[1]);
			if(elem.attrs &&
					elem.attrs[tmp[0]]==tmp[1])
					return true;
			else return false;
		}
		if(elem.tagName==selector)
			return true;
		return false;
	}
	//判断是不是空白字符
	isSpace(c) {
		for(let s of this.spaceChar)
			if(c==s) return true;
		return false;
	}
	//判断是不是一个字母（正则中的[a-zA-Z]）
	isChar(c) {
		var code=c.charCodeAt(0);
		if((code>=65 && code<=90) ||
			(code>=97 && code<=122))
			return true;
		return false;
	}
	//返回错误信息
	returnErr(code) {
		if(this.errCode[code])
			return `(${code})${this.errCode[code]}\r\n`;
		return "未知错误！\r\n";
	}
}

/* 
//实验：用函数状态机实现响应报文解析
class ResponseParserFun {
	constructor() {
		this.line="";
		this.statusCode="";
		this.statusText="";
		this.headers={};
		this.headerKey="";
		this.headerValue="";
		this.body="";
		this.parserBody=null;
		this.resLine=function(c) {
			if(c=="\n")
				return this.resHeaderEnd;
			this.line+=c;
			if(c==" ")
				return this.resLineStatusCode;
			return this.resLine;
		}
		this.resLineStatusCode=function(c) {
			this.line+=c;
			if(c==" ")
				return this.resLineStatusText;
			this.statusCode+=c;
			return this.resLineStatusCode;
		}
		this.resLineStatusText=function(c) {
			if(c=="\n")
				return this.resHeaderEnd;
			this.line+=c;
			this.statusText+=c;
			return this.resLineStatusText;
		}
		this.resHeader=function(c) {
			if(c=="\n")
				return this.resHeaderEnd;
			if(c==":")
				return this.resHeaderSpace;
			this.headerKey+=c;
			return this.resHeader;
		}
		this.resHeaderSpace=function(c) {
			if(c!=" ") {
				this.headerValue+=c;
				return this.resHeaderValue;
			}
			return this.resHeaderSpace;
		}
		this.resHeaderValue=function(c) {
			if(c=="\n") {
				this.headers[this.headerKey]=this.headerValue;
				this.headerKey=this.headerValue="";
				return this.resHeaderEnd;
			}
			this.headerValue+=c;
			return this.resHeaderValue;
		}
		this.resHeaderEnd=function(c) {
			if(c=="\n") {
				if(this.headers["Transfer-Encoding"]=="chunked")
					this.parserBody=new ResponseBodyParser();
				return this.resBody;
			}
			return this.resHeader(c);
		}
		this.resBody=function(c) {
			if(this.parserBody)
				this.parserBody.receiveChar(c);
			return this.resBody;
		}
		this.status=this.resLine;
	}
	receive(string) {
		for(let i=0; i<string.length; i++)
			this.receiveChar(string[i]);
		if(this.parserBody)
			this.body=this.parserBody.body;
		return {
			line:this.line,
			statusCode:this.statusCode,
			statusText:this.statusText,
			headers:this.headers,
			body:this.body
		};
	}
	receiveChar(c) {
		if(c=="\r") return;
		//console.log(this.status)
		this.status=this.status(c);
	}
} 
*/

exports.ResponseParser=ResponseParser;
exports.HtmlParser=HtmlParser;






