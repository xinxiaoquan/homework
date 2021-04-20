//客户端，发送HTTP请求

const parserJS=require("./parser.js");
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
			var parser=new parserJS.ResponseParser();
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

/* var r=new Request({
	headers:{
		port:666
		//"content-type":"application/json"
	},
	body:{
		mess:"你好"
	}
});
r.send(); */

var p=new parserJS.HtmlParser();
p.parserHtml(
`<div id="box">你好<img src="1.jpg" class="a1 b2" /></div>`
);





























