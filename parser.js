
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

//html数据解析类
class HtmlParser {
	constructor() {
		//空白字符合集
		this.spaceChar=["\r","\n","\t"," ","\f"];
		//错误代码合集
		this.errCode={
			ERRER01:"结束标签有不合法的空白字符！",
			ERRER02:"结束标签没有闭合！",
			ERRER03:"标签无引号包裹的属性值前面不能有非法的空白字符",
		}
		this.status=this.data;
		this.EOF=Symbol("EOF");
		this.data=function(c) {
			if(c=="<")
				return this.tagNameStart;
			if(c==this.EOF)
				return this.end;
			return this.data;
		}
		this.tagNameStart=function(c) {
			if(c=="/")
				return this.tagNameEnd;
			if(this.isSpace(c))
				return this.attrKey;
			if(c==">") return this.data;
			return this.tagNameStart;
		}
		this.tagNameEnd=function(c) {
			if(this.isSpace(c))
				return this.err(this.returnErr("ERRER01"));
			if(this.isChar(c))
				return this.tagNameEnd;
			if(c==this.EOF)
				return this.err(this.returnErr("ERRER01"));
			if(c==">")
				return this.data;
		}
		this.attrKey=function(c) {
			if(this.isChar(c)) {
				
			}
			/* if(this.isSpace(c))
				return this.attrKey; */
			if(c=="=")
				return this.attrValue;
			return this.attrKey;
		}
		this.attrValue=function(c) {
			if(this.isQuot(c))
				return this.attrValuePlus;
			if(this.isSpace(c))
				return this.tagNameStart;
			return attrValue;
		}
		this.attrValuePlus=function(c) {
			if(this.isQuot(c)) 
				return tagNameStart;
			return this.attrValuePlus;
		}
		this.err=function(mess) {
			console.log(mess);
			return this.end;
		}
		this.end=function(c) {
			return this.end;
		}
	}
	parserHtml(string) {
		for(var i=0; i<string.length; i++)
			this.status=this.status(string[i]);
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
	//判断是不是引号
	isQuot(c) {
		if(c=="\"" || c=="'")
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






