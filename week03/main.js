//解析CSS的主入口
var PJS=require("./parser.js");

var p=new PJS.HtmlParser;
p.parse(`
<style>
	div [class=b2] {
		width:100px;
		height:200px;
	}
	img {
		border:1px solid #555;
	}
	div .a1 {
		display:none;
	}
	#box .b2 {
		width:800px;
	}
	#box {
		font-size:10px;
	}
</style>
<div id="box">
	你好
	<img src="1.jpg" />
	<span class="a1 b2">hello</span>
</div>
`);


























