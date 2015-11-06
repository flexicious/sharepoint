/**
 * Created by 19.06.2013-7pm on 09-Oct-15.
 */
var CostGridController  = window.CostGridController = {};
CostGridController.selectedItem = null;

CostGridController.level1Filter = null;
CostGridController.level2Filter = null;
CostGridController.titleFilter = null;
CostGridController.projectNameFilter = null;

CostGridController.flatDataProviderBackup = null;

CostGridController.onCreationComplete = function(event){
    CostGridController.grid = event.target;
    CostGridController.grid.controller = CostGridController;
    CostGridController.fetchAllData();

    CostGridController.grid.addEventListener(this,"AddItemClick",function(e){
        $('#addForm').modal('show');
    });

    $('#addForm').on('hidden.bs.modal', function () {
        CostGridController.selectedItem = null;
    });

    $('#addForm').on('show.bs.modal', function (event) {
        if(event.target.localName == "input"){ // date picker popup will call this again, so just ignore it
            return;
        }
        if(CostGridController.selectedItem == null) {
            $("#titleText").val("");
            $("#year2015").val(0);
            $("#year2016").val(0);
            $("#year2017").val(0);
            $("#year2018").val(0);
            $("#year2019").val(0);
            $("#gwRoleCombo").val(1);
            $("#level1Combo").val("Capital");
            $("#level1Combo").selectpicker('refresh');
            $("#level2Combo").val("Equipment");
            $("#level2Combo").selectpicker('refresh');
            $("#transactionDate").datepicker("setDate", new Date());
            $("#yearField2015").val(0);
            $("#projectName").val("");

            $("#addFormTitle").html("New Item");
        } else {
            $("#addFormTitle").html("Edit Item");
        }
    });
};

CostGridController.onFilterPageSortChange = function (event) {
    if (event.cause == flexiciousNmsp.ExtendedFilterPageSortChangeEvent.FILTER_CHANGE) {
        CostGridController.level1Filter = CostGridController.grid.getFilterValue("Level1");
        CostGridController.level2Filter = CostGridController.grid.getFilterValue("Level2");
        CostGridController.titleFilter = CostGridController.grid.getFilterValue("Title");
        CostGridController.projectNameFilter = CostGridController.grid.getFilterValue("Project_x0020_Name");
        CostGridController.filterAndApplyData();
    }
};

CostGridController.filterAndApplyData = function(){
    var dp = CostGridController.flatDataProviderBackup;
    var qulifiedItems = [];
    for(var i = 0; i < dp.length; i++){
        var data = dp[i];
        if(CostGridController.level1Filter && data.Level1 && data.Level1.indexOf(CostGridController.level1Filter) == -1) continue;
        if(CostGridController.level2Filter && data.Level2 && data.Level2.indexOf(CostGridController.level2Filter) == -1) continue;
        if(CostGridController.titleFilter && data.Title && data.Title.indexOf(CostGridController.titleFilter) == -1) continue;
        if(CostGridController.projectNameFilter){
            var found = false;
            for(var j = 0; j < CostGridController.projectNameFilter.length; j++) {
                //data.Project_x0020_Name.indexOf(CostGridController.projectNameFilter) == -1) continue;
                var item = CostGridController.projectNameFilter[j];
                if(data.Project_x0020_Name+"" && (data.Project_x0020_Name+"").indexOf((""+item)) != -1) {
                    found = true;
                    break;
                }
            }
            if(!found)
                continue;
        }
        qulifiedItems.push(data);
    }
    var currentLevel = CostGridController.grid._currentExpandLevel;
    CostGridController.grid.setDataProvider(CostGridController.groupData(qulifiedItems));
    CostGridController.grid.expandToLevel(currentLevel);
};

CostGridController.fetchAllData = function () {
    Service.get(GridConfig.ServiceBaseUrl+GridConfig.CostServiceRelativeUrl,undefined, undefined, function(res){
        console.log(res);
        var dp = res.d.results;
        CostGridController.flatDataProviderBackup = dp;
        var projectNameColumn = CostGridController.grid.getColumnByDataField("Project_x0020_Name");
        if(projectNameColumn && projectNameColumn.filterComboBoxBuildFromGrid){
            projectNameColumn.filterComboBoxBuildFromGrid = false;
            projectNameColumn.filterComboBoxDataProvider = projectNameColumn.getDistinctValues(CostGridController.flatDataProviderBackup);
        }
        CostGridController.grid.setDataProvider(CostGridController.groupData(dp));
        CostGridController.grid.expandToLevel(1);
    }, function (xhr) {
        alert("Error occur on service call. please check you have logged in");
    });
};

CostGridController.groupData = function (rawData){
    var groupByLevel1 = Utils.groupBy(rawData, "Level1");
    for(var i = 0; i < groupByLevel1.length; i++){
        var groupByLevel2 = Utils.groupBy(groupByLevel1[i].children, "Level2");
        for(var j = 0; j < groupByLevel2.length; j++){
            var childs = [];
            for(var m = 0; m < groupByLevel2[j].children.length; m++) {
                var obj = groupByLevel2[j]["children"][m];
                var formattedObj = {};

                var total = 0;
                for (var k = 1; k <= 5; k++) {
                    formattedObj["Year" + k] = obj["Year" + k];
                    total += parseInt(obj["Year" + k]) ? parseInt(obj["Year" + k]) : 0;
                }
                formattedObj.total = total;
                formattedObj.Project_x0020_Name = obj.Project_x0020_Name;
                formattedObj.Title = obj.Title;
                formattedObj.original = obj;
                childs.push(formattedObj);
            }
            groupByLevel2[j].children = childs;
            groupByLevel2[j].Year1 = flexiciousNmsp.UIUtils.sum(childs, "Year1");
            groupByLevel2[j].Year2 = flexiciousNmsp.UIUtils.sum(childs, "Year2");
            groupByLevel2[j].Year3 = flexiciousNmsp.UIUtils.sum(childs, "Year3");
            groupByLevel2[j].Year4 = flexiciousNmsp.UIUtils.sum(childs, "Year4");
            groupByLevel2[j].Year5 = flexiciousNmsp.UIUtils.sum(childs, "Year5");
            groupByLevel2[j].total = 0;
            for(var w  = 1; w <= 5; w++)
                groupByLevel2[j].total += parseInt(groupByLevel2[j]["Year"+w]) ? parseInt(groupByLevel2[j]["Year"+w]) : 0;

        }
        groupByLevel1[i].children = groupByLevel2;
        groupByLevel1[i].Year1 = flexiciousNmsp.UIUtils.sum(groupByLevel2, "Year1");
        groupByLevel1[i].Year2 = flexiciousNmsp.UIUtils.sum(groupByLevel2, "Year2");
        groupByLevel1[i].Year3 = flexiciousNmsp.UIUtils.sum(groupByLevel2, "Year3");
        groupByLevel1[i].Year4 = flexiciousNmsp.UIUtils.sum(groupByLevel2, "Year4");
        groupByLevel1[i].Year5 = flexiciousNmsp.UIUtils.sum(groupByLevel2, "Year5");
        groupByLevel1[i].total = 0;
        for(var v  = 1; v <= 5; v++)
            groupByLevel1[i].total += parseInt(groupByLevel1[i]["Year"+v]) ? parseInt(groupByLevel1[i]["Year"+v]) : 0;
    }
    return groupByLevel1;
};

CostGridController.yearColumnLabelFunction = function(data, col){
    var val = parseInt(flexiciousNmsp.UIUtils.resolveExpression(data, col.dataField) == null ? 0 : flexiciousNmsp.UIUtils.resolveExpression(data, col.dataField));
    if(isNaN(val))
        val = 0;
    return "$ " + val.toLocaleString();
};

CostGridController.yearAndTotalFooterColumnLabelFunction = function(col){
    var val = flexiciousNmsp.UIUtils.sum(col.level.grid.getDataProvider(), col.dataField);
    if(isNaN(val))
        val = 0;
    return "$ " + val.toLocaleString();
};

CostGridController.validateForm = function (){
    if(!$("#titleText").val()){
        alert("Title is require");
        return false;
    }
    return true;
};

CostGridController.updateItem = function(selectedItem){
    CostGridController.selectedItem = selectedItem;
    $("#addForm").modal('show');
    $("#titleText").val(selectedItem.Title);
    $("#year2015").val(selectedItem.Year1);
    $("#year2016").val( selectedItem.Year2 );
    $("#year2017").val(selectedItem.Year3);
    $("#year2018").val(selectedItem.Year4);
    $("#year2019").val(selectedItem.Year5);
    $("#gwRoleCombo").val(selectedItem.gwRole);
    $("#gwRoleCombo").selectpicker('refresh');
    $("#level1Combo").val(selectedItem.Level1);
    $("#level1Combo").selectpicker('refresh');
    $("#level2Combo").val(selectedItem.Level2);
    $("#level2Combo").selectpicker('refresh');
    $("#transactionDate").datepicker("setDate", new Date(Date.parse(selectedItem.Transactio_x0020_Date)));
    $("#yearField2015").val(selectedItem.Year2015);
    $("#projectName").val(selectedItem.Project_x0020_Name);
};


CostGridController.saveItem = function (){
    if(!CostGridController.validateForm())
        return;

    var isCreate = CostGridController.selectedItem == null;
    var item = {};
    item.__metadata = {
        "type": "SP.Data.CostListItem"
    };
    item.Title = $("#titleText").val();
    item.Year1 = parseInt($("#year2015").val());
    item.Year2 = parseInt($("#year2016").val());
    item.Year3 = parseInt($("#year2017").val());
    item.Year4 = parseInt($("#year2018").val());
    item.Year5 = parseInt($("#year2019").val());
    item.gwRole = $("#gwRoleCombo").val();
    item.Level1 = $("#level1Combo").val();
    item.Level2 = $("#level2Combo").val();
    item.Transactio_x0020_Date = $("#transactionDate").datepicker("getDate").toISOString();
    item.Year2015 = parseInt($("#yearField2015").val());
    item.Project_x0020_Name = $("#projectName").val();

    function success(res) {
        console.log(res);
        $("#addForm").modal('hide');
        CostGridController.fetchAllData();
    }
    function error (err) {
        console.log(err);
        $("#errorMessage").html("Error occurred while saving item");
    }

    if(isCreate) {
        Service.addItem(GridConfig.CostServiceAbsoluteUrl,item, success, error);
    } else {
        Service.updateItem(GridConfig.CostServiceAbsoluteUrl,item, CostGridController.selectedItem.__metadata.etag, CostGridController.selectedItem.Id, success, error);
    }
};

CostGridController.deleteItem = function(item){
    Service.deleteItem(GridConfig.CostServiceAbsoluteUrl, item, function(res){
        CostGridController.fetchAllData();
        alert("deleted successfully")
    }, function(err){
        console.log(err);
        alert("failed to delete")
    });
} ;
