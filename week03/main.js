//解析CSS的主入口
var PJS=require("./parser.js");

var p=new PJS.HtmlParser;
var res=p.parse(`
<style>
	#box {
		width:300px;
		display:flex;
	}
	#box .item {
		width:50px;
		height:20px;
	}
</style>
<div id="box">
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
</div>
`);
/* var sum=0;
for(var i=0; i<res.children[3].children.length; i++)
	if(res.children[3].children[i].type=="element") {
		sum++;
		console.log(res.children[3].children[i].computedStype);
	}
console.log(sum);

 */























