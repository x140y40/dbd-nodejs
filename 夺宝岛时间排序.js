setInterval(treasureboxToEnd,1000);
setInterval(setRtime,100);

function setRtime(){
	var treasureBoxs = $('div[id^="treasureBox_"]');
	for(var i=0;i<treasureBoxs.length;i++){
		var rTime = $(treasureBoxs[i]).attr("r") - 100;
		if(rTime > 0){
			$(treasureBoxs[i]).attr("r",rTime);
		}
	}
}

function rightZeroStr(v) {
    if (v < 10) {
        return "0" + v;
    }
    return v + "";
}

function formatTime(time){
	  time = time+"";
	  var text = "";
	  for(i=0;i<time.length;i++){
		  var t = "<span>"+time.charAt(i)+"</span>";
		  text+=t;
	  }
	  return text;
}


//计算时间差
function timeBetweenText(rTime, showType) {
	var timeOffset = rTime;
	var dayOfMil = (24 * 60 * 60 * 1000);
    var hourOfMil = 60 * 60 * 1000;
    var minOfMil = 60 * 1000;
    var secOfMil = 1000;
    
    var hourOffset = timeOffset % dayOfMil;
    var minuteOffset = hourOffset % hourOfMil;
    var seccondOffset = minuteOffset % minOfMil;
    
    var hours = Math.floor(timeOffset / hourOfMil);
    var minutes = Math.floor(minuteOffset / minOfMil);
    var secconds = Math.floor(seccondOffset / secOfMil);
    var mmi = parseInt((timeOffset%1000)/10);
    
    if(typeof(showType) == "undefined" || showType == 0){
    	if (hours > 0) {
    		return rightZeroStr(hours)+"时"+rightZeroStr(minutes) +"分"+rightZeroStr(secconds) + "秒" + mmi;
        } else if (minutes > 0) {
        	return rightZeroStr(minutes)+"分"+rightZeroStr(secconds)+"秒" + mmi;
        } else if (secconds > 0) {
        	return rightZeroStr(secconds)+"秒" + mmi;
        } else if (mmi > 0) {
        	return "0."+mmi+"秒";
        } else{
        	return "0.00秒";
        }
    	
    }else if(showType == 1){
    	//00:00:00
    	return rightZeroStr(hours)+":"+rightZeroStr(minutes) +":"+rightZeroStr(secconds);
    }else if(showType == 2){
    	if (hours > 0) {
    		return formatTime(hours)+"<em>:</em>"+formatTime(minutes) +"<em>:</em>"+formatTime(secconds);
        } else if (minutes > 0) {
        	return "<span>0</span><span>0</span><em>:</em>"+formatTime(minutes)+"<em>:</em>"+formatTime(secconds);
        } else if (secconds > 0) {
        	return "<span>0</span><span>0</span<em>:</em><span>0</span><span>0</span<em>:</em>"+formatTime(secconds);
        } else{
        	return "<span>0</span><span>0</span><em>:</em><span>0</span><span>0</span><em>:</em><span>0</span><span>0</span>";
        }
    	
    }else{
    	return "";
    }
}

function treasureboxToEnd(){
	generalTreasureboxToEndToEnd();
}

function getHref(){
	var url = window.location.href;
	var bool = url.indexOf("//dbd.jd.com/myTreasureBox.html");
	if(bool=='-1'){
		return false;
	}
	return true;
//	return "//dbd.jd.com/myTreasureBox.html";
}


//更新倒计时及样式
function generalTreasureboxToEndToEnd(){
	var shows = $('div[id^="ProductShow|"]');
	
	var treasureBoxs = $('div[id^="treasureBox_"]');
	for(var i=0;i<treasureBoxs.length;i++){
		var li = treasureBoxs[i];
		var reducePrice = $(treasureBoxs[i]).attr("reducePrice");
		var endTime = $(treasureBoxs[i]).attr("endTime");
		var startTime = $(treasureBoxs[i]).attr("startTime");
		var rTime = $(treasureBoxs[i]).attr("r");
		var astatus = $(treasureBoxs[i]).attr("a");
		var atype = $(treasureBoxs[i]).attr("atype");
		var text;
		var progress = 0;
		if(astatus=="0"){
			//等待拍卖
			text = timeBetweenText(rTime, 1);
			var texts = [];
			texts = text.split(":");
			var paimais = $(li).attr("id").split("_");
			var paimaiId = "";
			if(paimais.length>=2){
				paimaiId = paimais[1];
			}
			var str = '<div class=\"fl\">距离开拍<span class=\"icon i2\"></span></div>'
				+ '<div class=\"timer\">'+'<em class="hour">'+texts[0]+'</em>时&nbsp;&nbsp;<em class="hour">'+texts[1]+'</em>分&nbsp;&nbsp;<em class="hour">'+texts[2]+'</em>秒'+'</div>';
			$(li).html(str);
			$(li).siblings("div.state").attr("class","state_n").html('');
			//$(li).siblings("div.clearfix").html('由京东发货');
			$(li).siblings('div.clearfix').find('.fr').hide();
			if(getHref()){
				$(li).siblings("div.submit_btn").html('<a href=\"javascript:void(0);\" onclick=\"addtreasurebox(\''+paimaiId+'\')\" class=\"y_btn\">距离开拍</a>');
			} else {
				$(li).siblings("div.submit_btn").html('<a href=\"javascript:void(0);\" onclick=\"addtreasurebox(\''+paimaiId+'\')\" class=\"y_btn\">加入夺宝箱</a>');
			}
		}else if(astatus=="2"){
			//拍卖结束
			$(li).parent().parent().attr("class","over");
			$(li).html('<div class=\"fl\">竞拍已结束<span class=\"icon i3\"></span></div><div class=\"timer\"></div>');
			$(li).siblings("div.submit_btn").html('<a href=\"#\" class="gray_btn">已结束</a>');
			$(li).siblings("div.state").attr("class","state_n").html('');
			//$(li).siblings("div.clearfix").html('由京东发货');
		}else{
			//正在拍卖
			text = timeBetweenText(rTime, 1);
			if(rTime<=100){
				loadDataAjax();
				return;
			}
			progress = 100-(parseInt(rTime)*100/(parseInt(endTime)-parseInt(startTime))).toFixed(2);
			var texts = [];
			try{
				texts = text.split(":");
			}catch(e){}
			var str = "";
			if(texts[0]!="NaN"){
				if(atype=="0"){
					str = '<div class=\"fl\">距离降'+reducePrice+'元<span class=\"icon i1\"></span></div>'
						+ '<div class=\"timer\">'+'<em class="hour">'+texts[1]+'</em>分&nbsp;&nbsp;<em class="hour">'+texts[2]+'</em>秒'+'</div>';
				} else {
					str = '<div class=\"fl\">时间剩余<span class=\"icon i1\"></span></div>'
						+ '<div class=\"timer\">'+'<em class="hour">'+texts[0]+'</em>时&nbsp;&nbsp;<em class="hour">'+texts[1]+'</em>分&nbsp;&nbsp;<em class="hour">'+texts[2]+'</em>秒'+'</div>';
				}
			}

			$(li).next().find('span').attr('style','width: '+progress+'%;');
			$(li).html(str);
		}
	}
}

function isnull(v){
	return v==null||typeof(v) == "undefined";
}

function callbackfunc(data){
	console.log("callbackfunc=" + data);
}

function getUrl(paimaiId){
	return '//dbditem.jd.com/'+paimaiId;
}

function getImageUrl(image){
	return '//img10.360buyimg.com/n1/'+image;
}


function screening(status){
	paimaitypes = $('div[id^="paimaitype_"]');
	if(status=="0"){//全部
		$("#auctionType").val("all");
	}else if(status=="1"){//升价拍
		$("#auctionType").val("5");
	}else if(status=="2"){//一口价
		$("#auctionType").val("-1");
	}else if(status=="3"){//降价拍
		$("#auctionType").val("100");
	}
	$("#queryForm").submit();
}

function setOrderByParam(obj){
	$("#sortField").val(obj);
	$("#queryForm").submit();
}

function filterStatus(status){
	var _filterStatus = $('span[name="filter_status"]');
	var _useStatusStr = "";
	var _recordType = "";
	if(status == "4"){
		if($(_filterStatus[3]).attr("s")==""){
			$(_filterStatus[3]).attr("s","true");
		} else {
			$(_filterStatus[3]).attr("s","false");
		}
		if($(_filterStatus[3]).attr("s")=="true"){
			_recordType = "1";
		}
		$("#recordType").val(_recordType);
	} else {
		if($(_filterStatus[status-1]).attr("s")==""){
			$(_filterStatus[status-1]).attr("s","true");
		} else {
			$(_filterStatus[status-1]).attr("s","false");
		}
		
		for(var i = 0; i < _filterStatus.length; i++){
			if($(_filterStatus[i]).attr("s")=="true" && i != 3){
				if(_useStatusStr==""){
					_useStatusStr = _useStatusStr + (i+1);
				} else {
					_useStatusStr = _useStatusStr + "," + (i+1);
				}
			}
		}
		var _useStatus = $('input[name="use_status"]');
		if(_useStatusStr != ""){
			_useStatusStr = _useStatusStr;
		}
		$("#useStatus").val(_useStatusStr);
	}
	$("#queryForm").submit();
}


function showData(arr){
	if(arr == null || arr.length <= 0){
		return;
	}
	for(var i = 0 ; i < arr.length ; i++){
		var item = arr[i];
		if(item != null){
			$('#currentNum_' + item.paimaiId).text(item.bidCount);
			$('#treasureBox_' + item.paimaiId).attr("r",item.remainTime);
			$('#treasureBox_' + item.paimaiId).attr("reducePrice",item.reducePrice);
			$('#treasureBox_' + item.paimaiId).attr("a",item.auctionStatus);
			$('#treasureBox_' + item.paimaiId).attr("atype",item.auctionType);
			$('#treasureBox_' + item.paimaiId).attr("endTime",item.endTime);
			$('#treasureBox_' + item.paimaiId).attr("startTime",item.startTime);
			if(item.auctionType=="-1"){
				$('#paimaitype_' + item.paimaiId).attr("class","form up");
			} else if(item.auctionType=="0"){
				$('#paimaitype_' + item.paimaiId).attr("class","form down");
			} else if(item.auctionType=="5"){
				$('#paimaitype_' + item.paimaiId).attr("class","form up");
			}
			$("#paimaiCurrentPrice_" + item.paimaiId).html("<i>¥</i>"+item.currentPriceStr);
			$("#currentPrice_" + item.paimaiId).val(item.currentPriceStr);
			$("#maxPrice_" + item.paimaiId).val(item.priceHigherOffset);
			$("#minPrice_" + item.paimaiId).val(item.priceLowerOffset);
			
			if(item.auctionStatus==0){
				$('#li-'+item.paimaiId).attr('class','join');
			}
		}
	}
}

var lock = 0;
function loadDataAjax(){
	if(lock == 0){
		lock = 1;
		loadDatas();
		lock = 0;
	}
}

function loadDatas(){
	if(paimaiIds == null || paimaiIds.length <= 0){
    	return;
    }
    var paimaiIdStr = "";
    for(var i = 0 ; i < paimaiIds.length ; i++){
        if(i != 0){
       		paimaiIdStr += "-";
        }
        paimaiIdStr += paimaiIds[i];
    }
	jQuery.ajax({
        url: "//dbditem.jd.com/services/currentList.action?paimaiIds=" + paimaiIdStr + "&callback=showData&t=" + new Date().getTime(),
        type: 'GET',
        dataType: 'JSONP',
        success: function (data) {
			showData(data);
        }
    });
	
}


(function(){
	loadDatas();
	var bidModel = $('a[name="bidModel"]');
	for(var i = 0; i < bidModel.length; i++){
		$(bidModel[i]).unbind("click");
	}
	var filter_status = $("#useStatus").val();
	if(filter_status!=undefined){
		var _filter_status = filter_status.split(",");
		$('span[name="filter_status"]');
		for(var i=0;i<_filter_status.length;i++){
			$($('span[name="filter_status"]')[_filter_status[i]-1]).attr("s","true");
			$($('span[name="filter_status"]')[_filter_status[i]-1]).attr("class","checked");
		}
	}
	var _auctionType = $("#auctionType").val();
	if(_auctionType=="all" || _auctionType=="0"){//全部
		$("#auctionType_0").attr("class","curr");
		$("#paimaixingshi").attr("data-key","0");
		$("#paimaixingshi").text("全部");
	}else if(_auctionType=="5" || _auctionType=="1"){//升价拍
		$("#auctionType_1").attr("class","curr");
		$("#paimaixingshi").attr("data-key","1");
		$("#paimaixingshi").text("升价拍");
	}else if(_auctionType=="-1" || _auctionType=="2"){//一口价
		$("#auctionType_2").attr("class","curr");
		$("#paimaixingshi").attr("data-key","2");
		$("#paimaixingshi").text("一口价");
	}else if(_auctionType=="100"){//降价拍
		$("#auctionType_3").attr("class","curr");
		$("#paimaixingshi").attr("data-key","3");
		$("#paimaixingshi").text("降价拍");
	} else {
		$("#auctionType_0").attr("class","curr");
	}
	
	
	var _sortField = $("#sortField").val();
	if(_sortField=="all"){//综合排序
		$("#sortField_"+_sortField).attr("class","curr");
		$("#sortField_show").attr("data-key","all");
		$("#sortField_show").text("综合排序");
	}else if(_sortField=="0"){//开始时间
		$("#sortField_"+_sortField).attr("class","curr");
		$("#sortField_show").attr("data-key","0");
		$("#sortField_show").text("开始时间");
	}else if(_sortField=="2"){//即将结束
		$("#sortField_"+_sortField).attr("class","curr");
		$("#sortField_show").attr("data-key","2");
		$("#sortField_show").text("即将结束");
	}else if(_sortField=="3"){//等待开拍
		$("#sortField_"+_sortField).attr("class","curr");
		$("#sortField_show").attr("data-key","3");
		$("#sortField_show").text("等待开拍");
	} else {
		$("#sortField_0").attr("class","curr");
	}
	
	
	if($("#recordType").val()=="1"){
		$($('span[name="filter_status"]')[3]).attr("s","true");
		$($('span[name="filter_status"]')[3]).attr("class","checked");
	}
	
	if($("#searchtitle").val()!=""){
		$("#serchLabel").text("");
	}
	
	$('#searchText').val($('#searchParam').val());
})();

function searchForTitle(){
	$("#searchForTitle").val($("#searchtitle").val());
	$("#queryForm").attr("action","/myTreasureBox.html");
	$("#queryForm").submit();
}

function closcjid(){
	$("#div.cjid").hide();
}


