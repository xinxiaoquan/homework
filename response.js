//服务端，返回HTTP响应
const http=require("http");
const fs=require("fs");
var htmlFile=fs.readFileSync("code.html");

http.createServer(function(req, res) {
	//postData是存储post传输过来的数据
	var postData="", body={};
	req.on("error", (err)=>{
		console.log(err);
	});
	//这个事件只能获取post请求
	req.on("data", (data)=>{
		postData+=data;
	});
	req.on("end", ()=>{
		if(postData) {
			//post接受的数据用&分割转成一个临时数组
			let tmpArr=postData.split("&");
			for(var i=0; i<tmpArr.length; i++) {
				let tmp=tmpArr[i].split("=");
				let key=tmp[0];
				let val=tmp[1];
				body[key]=val;
			}
		}
		res.writeHead(200, {
			"content-type":"text/html"
		});
		/* if(Object.keys(body).length>0)
			htmlFile+="<!--服务端已经获取到你发送的数据-->"; */
		res.end(htmlFile);
	});
}).listen(666);































