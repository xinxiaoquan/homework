var LexJS=require("./lexParser.js");

var syntax={
	program:[["StatementList","EOF"]],
	StatementList:[
		["StatementList"],
		["Statement"]
	],
	Statement:[
		["IfStatement"],
		["FunctionDeclaration"],
		["VariableDeclaration"],
		["ExpressionStatement"],
		["WhileStatement"],
		["Block"],
		["BreakStatement"],
		["ContinueStatement"]
	],
	BreakStatement:[
		["break",";"]
	],
	ContinueStatement:[
		["continue",";"]
	],
	Block:[
		["{","StatementList","}"],
		["{","}"]
	],
	WhileStatement:[
		["while","(","Expression",")","Statement"]
	],
	IfStatement:[
		["if","(","ExpressionStatement",")","StatementList"]
	],
	FunctionDeclaration:[
		["function","Literal","(",")","{","StatementList","}"]
	],
	VariableDeclaration:[
		["var","Literal"],
		["let","Literal"],
	],
	ExpressionStatement:[
		["Expression",";"]
	],
	Expression:[
		["AssignmentExpression"]
	],
	AssignmentExpression:[
		["LeftHandSideExpression","=","LogicalORExpression"],
		["LogicalORExpression"]
	],
	LogicalORExpression:[
		["LogicalAEDExpression"],
		["LogicalORExpression","||","LogicalORExpression"]
	],
	LogicalAEDExpression:[
		["AdditiveExpression"],
		["LogicalAEDExpression","&&","AdditiveExpression"]
	],
	AdditiveExpression:[
		["MultiplicativeExpression"],
		["AdditiveExpression","+","MultiplicativeExpression"],
		["AdditiveExpression","-","MultiplicativeExpression"]
	],
	MultiplicativeExpression:[
		["LeftHandSideExpression"],
		["MultiplicativeExpression","*","LeftHandSideExpression"],
		["MultiplicativeExpression","/","LeftHandSideExpression"]
	],
	LeftHandSideExpression:[
		["CallExpression"],
		["NewExpression"]
	],
	CallExpression:[
		["MemberExpression","Arguments"],
		["CallExpression","Arguments"]
	],
	Arguments:[
		["(",")"],
		["(","ArgumentsList",")"]
	],
	NewExpression:[
		["MemberExpression"],
		["new","NewExpression"]
	],
	MemberExpression:[
		["PrimaryExpression"],
		["PrimaryExpression",".","Identifier"],
		["PrimaryExpression","[","Expression","]"]
	],
	PrimaryExpression:[
		["(","Expression",")"],
		["Literal"],
		["Identifier"]
	],
	Literal:[
		["NumbericLiteral"],
		["StringLiteral"],
		["BooleanLiteral"],
		["NullLiteral"],
		["RegularExpressionLiteral"],
		["ObjectLiteral"],
		["ArrayLiteral"]
	],
	ObjectLiteral:[
		["{","}"],
		["{","PropertyList","}"]
	],
	PropertyList:[
		["Property"],
		["PropertyList",",","Property"]
	],
	Property:[
		["StringLiteral",":","AdditiveExpression"],
		["Identifier",":","AdditiveExpression"]
	],
}

var end={
	isEnd:true
};

var start={
	program:end
};

var hash={};

function closure(state) {
	hash[JSON.stringify(state)]=state;
	
	var queue=[];
	for(var key in state)
		queue.push(key);

	while(queue.length) {
		var symbol=queue.shift();
		if(syntax[symbol]) {
			var arr=syntax[symbol];
			for(var k in arr) {
				if(!state[arr[k][0]]) {
					state[arr[k][0]]=true;
					queue.push(arr[k][0]);
				}
				var current=state;
				var arr2=arr[k];
				for(var i=0;i<arr2.length;i++) {
					if(!(current[arr2[i]] instanceof Object))
						current[arr2[i]]={};
					current=current[arr2[i]];
				}
				current.reduceType=symbol;
				current.reduceLength=arr2.length;
			}
		}
	}
		
	for(var key in state) {
		if(key=="reduceState" || key=="reduceType")
			continue;
		if(hash[JSON.stringify(state[key])])
			state[key]=hash[JSON.stringify(state[key])];
		else closure(state[key]);
	}	
}

closure(start);

//console.log(start);

function parse(str) {
	var getScan=LexJS.scan(str);
	var stack=[start];
	var symbolStack=[];
	while(true) {
		var tmp=getScan.next();
		if(tmp.value===undefined)
			break;
		var symbol=tmp.value;
		//console.log(symbol);
		shift(symbol);
	}
		
	function shift(symbol) {
		var state=stack[stack.length-1];

		if(symbol.type!==undefined) {
			if(state.hasOwnProperty(symbol.type)) {
				stack.push(state[symbol.type]);
				symbolStack.push(symbol);
				//state=state[symbol.value];
			} else{
				shift(reduce());
				shift(symbol);
				//reduce(state);
			}
		}
	}
	
	function reduce() {
		var state=stack[stack.length-1];
		console.log(state);
		console.log("\n\n");
		if(state.reduceType) {
			var children=[];
			for(let i=0;  i<state.reduceLength; i++) {
				stack.pop();
				children.push(symbolStack.pop());
			}
			return {
				type:state.reduceType,
				children:children.reverse()
			}
		} else throw new Error("无效token");
	}
	
	//return reduce();
}

parse(`
var a=10;
for(var i=0; i<a; i++)
	console.log(a+100);
`);




































