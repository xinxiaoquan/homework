//客户端，发送HTTP请求

const net=require("net");
class Request {
	//构造器中传入config配置信息（HTTP请求信息）
	constructor(config) {
		//HTTP请求行
		this["method"]=config["method"]||"post";
		this["path"]=config["path"]||"/";
		//HTTP请求头
		this["headers"]=config["headers"]||{};
		//HTTP请求主机和端口
		this["headers"]["host"]=config["headers"]["host"]||"127.0.0.1";
		this["headers"]["port"]=config["headers"]["port"]||80;
		//HTTP请求主体
		this["body"]=config["body"]||{};
	}
	
	//向服务端发送HTTP请求
	send(connect) {
		var info=this.formatHTTP();
		var that=this;
		return new Promise(function(resolve, reject) {
			var parser=new ResponseParser();
			var parserBody=new ResponseBodyParser();
			if(connect) connect.write(info);
			else {
				connect=net.createConnection({
					host:that["headers"]["host"],
					port:that["headers"]["port"]
				}, ()=> {
					connect.write(info);
				});
				connect.on("data", function(data) {
					data=data+"";
					var res=parser.receive(data);
					/* if(res.headers["Transfer-Encoding"]=="chunked")
						res.body=parserBody.receive(res.body); */
					console.log(res);
					connect.end();
				});
				connect.on("error", function(err) {
					reject(err);
					connect.end();
				});
			}
		});
	}
	
	//格式化请求信息
	formatHTTP() {
		var method=(this["method"]).toUpperCase();
		var path=this["path"];
		//生成请求行
		var line=`${method} ${path} HTTP/1.1\r\n`;
		//生成请求主体
		var bodyText=""
		if(!this["headers"]["content-type"]) {
			if(method=="POST")
				this["headers"]["content-type"]="application/x-www-form-urlencoded";
			bodyText=this.formatBodyText("urlencode");
		}else if(this["headers"]["content-type"]=="application/x-www-form-urlencoded")
			bodyText=this.formatBodyText("urlencode");
		if(this["headers"]["content-type"]=="application/json")
			bodyText=this.formatBodyText("json");
		if(method=="POST")
		//为请求头添加内容长度项
			this["headers"]["content-length"]=bodyText.length;
		//生成请求头
		var headers="";
		for(var key in this["headers"])
			headers+=`${key}:${this["headers"][key]}\r\n`;
		headers+="\r\n";
		if(method=="GET")
			return line+headers;
		return line+headers+bodyText;
	}
	
	//格式化请求内容
	formatBodyText(type) {
		if(!type || !this["body"])
			return "";
		if(type=="urlencode") {
			var data="";
			for(var key in this["body"])
				data+=`${key}=${encodeURIComponent(this["body"][key])}&`;
			return data.substring(0,data.length-1);
		}
		if(type=="json")
			return JSON.stringify(this["body"]);
	}
	
}

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
		console.log(string);
		for(let i=0; i<string.length; i++)
			this.receiveChar(string[i]);
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
			this.body+=c;
	}
}

//响应主体内容解析类
class ResponseBodyParser {
	
}

var r=new Request({
	headers:{
		port:666
		//"content-type":"application/json"
	},
	body:{
		name:"耿康康",
		sex:"男",
		age:"二十三"
	}
});
r.send();































