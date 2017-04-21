var http 		 = require('http'),
	https 		 = require('https'),
	querystring  = require('querystring'),
	cheerio 	 = require('cheerio'),
	fs 			 = require('fs');
//文件位置
var avgListTxt 			= "./avgList.txt";

//需要从前端传过来的数据
var	cookie 	= fs.readFileSync("./cookie.txt","utf-8");
//后端的初始数据
// var	IntervalTime = 10000,	//初始时间间隔
// 	IntervalID;				//计时器的ID

var InteralObj = {};	//计时器对象
//每个拍卖的计时器
function paimaiInterval(paimaiId,intervalId){
	InteralObj.paimaiId = intervalId;
}

function stopPaimai(paimaiId){
	clearInterval(InteralObj.paimaiId);
	console.log("已停止拍卖"+paimaiId);
}
//拍卖开始函数
function beginPaimai(paimaiId,maxprice,lastTime){
	var	IntervalTime = 10000,	//初始时间间隔
		IntervalID;				//计时器的ID
	
	function ready(paimaiInfo,maxprice,lastTime,paimaiId){
		paimaiInfo = paimaiInfo[0];
		//如果为拍卖请求，则hrefList为maxPrice，callback为lastTime
		function setIntervalTime(time){
			//如果要设置的频率和当前频率不同
			if(time !== IntervalTime){
				clearInterval(IntervalID);
				IntervalTime = time;
				IntervalID = setInterval(function(){
					getAuctionInfo(paimaiId,ready,maxprice,lastTime);
				},IntervalTime);
			}
			paimaiInterval(paimaiId,IntervalID);
			// console.log(InteralObj);
		}
		//倒计时时间
		var remainTime = paimaiInfo.remainTime;
		console.log("剩余时间：" + remainTime/1000 + "秒");
		//根据时间的不同，调整计时器的频率
		if(remainTime < 30000 && remainTime > 5000){
			setIntervalTime(1000);
		}else if(remainTime < 2000 && remainTime > lastTime){
			setIntervalTime(100);
		}else if(remainTime < lastTime && remainTime > 0){
			//如果当前价格小于设置的最高价格，就拍卖
			if(paimaiInfo.currentPrice < maxprice){
				//正式使用时改为paimaiInfo.currentPrice + 1
				sendPrice(paimaiId,paimaiInfo.currentPrice + 1);
				//上线时将下面一行取消
				clearInterval(IntervalID);
			}else{
				console.log("超过设置的最高价格");
			}
			setIntervalTime(100);
		}else if(remainTime < 0){
			clearInterval(IntervalID);
		}
	}
	//进行查询请求
	getAuctionInfo(paimaiId,ready,maxprice,lastTime);
	IntervalID = setInterval(function(){
		getAuctionInfo(paimaiId,ready,maxprice,lastTime);
	},IntervalTime);
	paimaiInterval(paimaiId,IntervalID);
};

//拍卖请求函数
function sendPrice(paimaiId,price){
	//请求信息
	var postData = querystring.stringify({
		't':(Date.now() + "").slice(-6),
		'paimaiId':paimaiId,
		'price':price,
		'proxyFlag':'0',
		'bidSource':'0'
	});
	//Request Headers
	var options = {
		hostname:'dbditem.jd.com',
		port:80,
		path:'/services/bid.action?'+postData,
		method:'GET',
		headers:{
			'Accept':'application/json, text/javascript, */*; q=0.01'
			,'Accept-Encoding':'gzip, deflate, sdch'
			,'Accept-Language':'zh-CN,zh;q=0.8,zh-TW;q=0.6'
			,'Connection':'keep-alive'
			,'Cookie':cookie
			,'Host':'dbditem.jd.com'
			,'Referer':'http://dbditem.jd.com/'+paimaiId
			,'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
			,'X-Requested-With':'XMLHttpRequest'
		}
	}
	//发送请求模块
	var req = http.request(options,function(res){
		var result
		//获取到数据
		res.on('data',function(chunk){
			//获取到的数据为buffer对象，需要转换为对象
			result = JSON.parse(chunk.toString());
		})
		//请求结束
		res.on('end',function(e){
			//抢拍结果
			console.log(paimaiId);
			console.log(result);
		})
		//请求出错
		res.on('error',function(e){
		})
	});
	req.write(postData);
	req.end();
}
//请求信息函数
function getAuctionInfo(paimaiIds,callback,self1,self2){
	//请求url拼接
	console.time('请求延迟');
	var dateNow = Date.now();
	var postData = querystring.stringify({
		'paimaiIds':paimaiIds,
		'callback':'jsonp_' + dateNow,
		'_':dateNow + 1
	});
	var url = "http://dbditem.jd.com/services/currentList.action?"+postData;
	//请求发送
	http.get(url, function(res) {
		var chunks = [];
		var size = 0;
		var paimaiInfo = "";
	    res.on('data',function(chunk){
			//将解压后的buffer对象转换为字符串
			//当chunk数据量过大时，采用如下方法拼接chunk，方法见https://cnodejs.org/topic/4faf65852e8fb5bc65113403
			chunks.push(chunk);  
  			size += chunk.length;
		});
	    res.on('end', function() {
	    	console.timeEnd('请求延迟');
	    	paimaiInfo = new Buffer(size);
  			for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
  				var chunkTemp = chunks[i];
  				chunkTemp.copy(paimaiInfo,pos);
  				pos += chunkTemp.length;
  			}
			paimaiInfo = paimaiInfo.toString();
			//返回的东西转换成字符串之后有一段用不到的。截取掉
			for (var i = 0; i < paimaiInfo.length; i++) {
				if(paimaiInfo[i] === '('){
					//获得将要拍卖对象的具体信息
		　　 		paimaiInfo = JSON.parse(paimaiInfo.slice(i+1,-1));
					break;
				}
			}
			if(callback){
				callback(paimaiInfo,self1,self2,paimaiIds);
			}
	    });
	}).on('error', function(res) {
	});
}

//删除所有的空格
function trim(str){ 
　　return str.replace(/(\s)*/g, "");
}

//获取paimaiId的页面内容
function getHTMLById(paimaiId,callback){
	var url = "http://dbditem.jd.com/" + paimaiId;
	http.get(url,function(res){
		var html = "";
		res.on('data',function(chunk){
			html += chunk.toString();
		});
		res.on('end',function(){
			callback(html);
		});
		res.on('error',function(e){
			console.log(e);
		});
	});
}

//根据获取到的HMTL得到名称
function getNameByHTML(html){
	var $ 				= cheerio.load(html),
		productStatus   = "【" + $('h1 i').text() + "】",
		productName     = $('.name').attr("title");
	console.log(productStatus + productName);
}

//根据productId获取同类商品
function getSameSkuById(productId){
	var url = "http://dbditem.jd.com/json/paimaiProduct/queryPaimaiBigField?id="+productId;
	http.get(url, function(res) {
		var chunks = [];
		var size = 0;
		var sameSku = "";
	    res.on('data',function(chunk){
			//将解压后的buffer对象转换为字符串
			//当chunk数据量过大时，采用如下方法拼接chunk，方法见https://cnodejs.org/topic/4faf65852e8fb5bc65113403
			chunks.push(chunk);  
  			size += chunk.length;
		});
	    res.on('end', function() {
	    	sameSku = new Buffer(size);
  			for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
  				var chunkTemp = chunks[i];
  				chunkTemp.copy(sameSku,pos);
  				pos += chunkTemp.length;
  			}
			sameSku = JSON.parse(sameSku.toString()).model.sameSku;
			console.log("同款待拍：");
			sameSku.forEach(function(value){
				console.log(value.paimaiId);
			});
	    });
	}).on('error', function(res) {
	});
}

//根据paimai获取历史平均价格
function getAvgBypaimaiId(paimaiId){
	getPidByNo(paimaiId,function(Pid){
		var arr = getAvgByPid(Pid);
		if(arr){
			console.log("历史均价："+ arr[0] + "\n最低价格：" + arr[1] + "\n最高价格：" + arr[2] + "\n历史总数：" + arr[3]);
		}else{
			console.log("这个商品第一次拍卖");
		}
	});
}

//根据paimaiId获取pid
function getPidByNo(paimaiId,callback){
	getAuctionInfo(paimaiId,function(paimaiInfo,callback){
		paimaiInfo = paimaiInfo[0];
		console.log("此物品项目ID："+paimaiInfo.productId);
		callback(paimaiInfo.productId);
	},callback);
}

//根据pid获取历史平均价格
function getAvgByPid(Pid){
	var list = JSON.parse(fs.readFileSync(avgListTxt,"utf-8"));
	return list[Pid+""];
}

//用cookie登录
function loginByCookie(cookie){
	var getData = querystring.stringify({
		'method':'Login',
		'callback':'callback',
		'_':Date.now()
	});
	var options = {
		hostname:'passport.jd.com',
		port:443,
		path:'/loginservice.aspx?'+getData,
		method:'GET',
		headers:{
			'Accept':'*/*',
			'Accept-Encoding':'gzip, deflate, sdch, br',
			'Accept-Language':'zh-CN,zh;q=0.8,zh-TW;q=0.6',
			'Connection':'keep-alive',
			'Cookie':cookie,
			'Host':'passport.jd.com',
			'Referer':'https://www.jd.com/',
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
		}
	}
	var req = https.request(options,function(res){
		res.on('data',function(chunk){
			var loginInfo = JSON.parse(chunk.toString().slice(9,-1));
			if(loginInfo.Identity.IsAuthenticated){
				console.log("你好，"+loginInfo.Identity.Name);
			}
			else{
				console.log("登录失败");
			}
		});
		res.on('end',function(){
			
		});
		res.on('error',function(e){
			// console.log(e);
		});
	})
	req.write(getData);
	req.end();
};

loginByCookie(cookie);
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('1.根据拍卖ID获取历史价格\n2.输入ID开始拍卖\n3.停止拍卖\n每次使用前请将最新的cookie填入，否则可能出现拍卖失败的情况\n');
rl.prompt();

rl.on('line', function(line){
    switch(line.trim()) {
        case '1':
	        rl.question("输入拍卖ID > ",function(paimaiId){
			    // 不加close，则不会结束
            	getAvgBypaimaiId(paimaiId);
            	getHTMLById(paimaiId,function(html){
					getNameByHTML(html);
					getPidByNo(paimaiId,function(productId){
						getSameSkuById(productId);
					});
				});
			    // rl.close();
			});
            break;
        case '2':
            rl.question("输入拍卖ID > ",function(paimaiId){
			    rl.question("最高不超过多少元 > ",function(maxprice){
            		rl.question("请输入最后出价时间（ms） > ",function(lastTime){
	            		beginPaimai(paimaiId,maxprice,lastTime);
					});
				});
			});
            break;
        case '3':
        	rl.question("输入需要停止的拍卖ID > ",function(paimaiId){
				 stopPaimai(paimaiId);
			});
    }
});