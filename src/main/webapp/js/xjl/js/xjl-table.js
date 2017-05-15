jQuery.extend(XJL,{
		initTable:function (tableDiv,baseURL,pageSize) {
			this.baseURL = baseURL;
			pageSize = pageSize||10,
	        //绑定table的viewmodel
	        this.tableViewModel = new ko.bootstrapTableViewModel({
	            url:baseURL,         //请求后台的URL（*）
	            method: 'get',                      //请求方式（*）
	            toolbar: '#toolbar',                //工具按钮用哪个容器
	            queryParams: function (param) {
	            	this.url = XJL.baseURL + "/query/" + this.pageNumber + "/" + this.pageSize;
	                return XJL.queryParams({search:param.search});
	            },//传递参数（*）
	            pagination: true,                   //是否显示分页（*）
	            detailView:true,
	            queryParamsType:'limit',
	            sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
	            pageNumber: 1,                      //初始化加载第一页，默认第一页
	            pageSize: pageSize,                       //每页的记录行数（*）
	            pageList: [pageSize,pageSize*2],        //可供选择的每页的行数（*）
	        });
	        ko.applyBindings(this.tableViewModel, document.getElementById(tableDiv));
	    },
	    initOperate:function (baseURL,domainModel) {
	        this.operateAdd(baseURL,jQuery.extend({}, domainModel));
	        this.operateUpdate(baseURL);
	        this.operateDelete(baseURL);
	        
	        this.domainModel =  jQuery.extend(true, {}, domainModel);
	    },
	    initOperate2:function (baseURL,fieldList) {
	    	var fieldNameList = fieldList.split(",");
	    	var domainModel = {};
	    	$.each(fieldNameList,function(key,val){
	    		domainModel[val]=ko.observable();
	    	});
	        this.initOperate(baseURL,domainModel);
	    },
	    //新增
	    operateAdd: function(baseURL,domainModel){
	        $('#btn_add').on("click", function () {
	            $("#myModal").modal().on("shown.bs.modal", function () {
	            	$("#myModalLabel").text("新增");
	            	var emptyDomainModel={};
	            	jQuery.each(domainModel, function(i, val) {  
	            		emptyDomainModel[i] = ko.observable();
	            	}); 
	                ko.utils.extend(XJL.domainModel, emptyDomainModel);
	                ko.applyBindings(XJL.domainModel, document.getElementById("myModal"));
	                XJL.operateSave(baseURL+"/add");
	            }).on('hidden.bs.modal', function () {
	                ko.cleanNode(document.getElementById("myModal"));
	            });
	        });
	    },
	    //编辑
	    operateUpdate: function (baseURL) {
	        $('#btn_edit').on("click", function () {
	        	
	        	var arrselectedData = XJL.tableViewModel.getSelections();
	            if (!XJL.operateCheck(arrselectedData)) { 
	            	return; 
	            }
	            $("#myModalLabel").text("修改");
	            $("#myModal").modal().on("shown.bs.modal", function () {
	                //将选中该行数据有数据Model通过Mapping组件转换为viewmodel
	                ko.utils.extend(XJL.domainModel, ko.mapping.fromJS(arrselectedData[0]));
	                ko.applyBindings(XJL.domainModel, document.getElementById("myModal"));
	                XJL.operateSave(baseURL+"/modify");
	            }).on('hidden.bs.modal', function () {
	                //关闭弹出框的时候清除绑定(这个清空包括清空绑定和清空注册事件)
	                ko.cleanNode(document.getElementById("myModal"));
	            });
	        });
	    },
	    //删除
	    operateDelete: function (baseURL) {
	        $('#btn_delete').on("click", function () {
	            var arrselectedData = XJL.tableViewModel.getSelections();
	            $.ajax({
	                url: baseURL+"/delete",
	                type: "post",
	                contentType: 'application/json',
	                data: JSON.stringify(arrselectedData),
	                success: function (data, status) {
	                    XJL.tableViewModel.refresh();
	                }
	            });
	        });
	    },
	    //保存数据
	    operateSave: function (url) {
	        $('#btn_submit').on("click", function () {
	        	console.log("submit click");
	            //取到当前的viewmodel
	            var oViewModel = XJL.domainModel;
	            XJL.beforeSubmit(oViewModel);
	            console.log("oViewModel", oViewModel);
	            //将Viewmodel转换为数据model
	            var oDataModel = ko.toJS(oViewModel);
	            console.log("oDataModel", oDataModel);
	            $.restPost({
	                url: url,
	                data: oDataModel,
	                success: function (data, status) {
	                	console.log("data",data);
	                	console.log("status",status);
	                    XJL.tableViewModel.refresh();
	                }
	            });
	        });
	    },
	    //数据校验
	    operateCheck:function(arr){
	        if (arr.length <= 0) {
	            alert("请至少选择一行数据");
	            return false;
	        }
	        if (arr.length > 1) {
	            alert("只能编辑一行数据");
	            return false;
	        }
	        return true;
	    },
	    beforeSubmit:function(oViewModel){
	    	
	    },
	    queryParams:function(params){
	    	return params;
	    }
})