/**
 * Created by 19.06.2013-7pm on 27-Oct-15.
 */

var ResourcePlanGridController = window.ResourcePlanGridController = {};
ResourcePlanGridController.selectedItem = null;

// top filter controls
ResourcePlanGridController.uoMCombobox = null;
ResourcePlanGridController.startDateChooser = null;
ResourcePlanGridController.endDateChooser = null;

// used to when re group the data on the filter firing
ResourcePlanGridController.flatDataProviderBackup = null;

// filter storage
ResourcePlanGridController.projectFilter = null;
ResourcePlanGridController.roleFilter = null;
ResourcePlanGridController.resourceFilter = null;

ResourcePlanGridController.uoMSelectedItem = "Hours"; // default it is hours;

ResourcePlanGridController.onCreationComplete = function (event) {
    ResourcePlanGridController.grid = event.target;
    ResourcePlanGridController.grid.controller = ResourcePlanGridController;
    ResourcePlanGridController.fetchAllData();

    ResourcePlanGridController.grid.addEventListener(this, "AddItemClick", function (e) {
        $('#resPlanAddForm').modal('show');
    });

    ResourcePlanGridController.grid.addEventListener(this, "EditItemClick", function (e) {
        ResourcePlanGridController.updateItem();
    });

    ResourcePlanGridController.grid.addEventListener(this, "DeleteItemClick", function (e) {
        if (confirm("Are you sure? do you want delete this item ?"))
            ResourcePlanGridController.deleteItem();
    });

    var resPlanPop = $('#resPlanAddForm');
    resPlanPop.on("hide.bs.modal", function () {
        ResourcePlanGridController.selectedItem = null;
        ResourcePlanGridController.grid.clearSelection();
    });

    resPlanPop.on("show.bs.modal", function () {
        if (ResourcePlanGridController.selectedItem == null) {
            $("#resPlanAddFormTitle").html("Add Item");
            ResourcePlanGridController.resetVal("resPlanProjectText", "");
            $("#resPlanGwRoleCombo").val("1");
            $("#resPlanGwRoleCombo").selectpicker("refresh");
            ResourcePlanGridController.resetVal("resPlanRoleText", "");
            ResourcePlanGridController.resetVal("resPlanResNameText", "");
            ResourcePlanGridController.resetVal("resPlanYear", "0");
            ResourcePlanGridController.resetVal("resPlanMonthNum", "0");
            ResourcePlanGridController.resetVal("resPlanMonthName", "");
            ResourcePlanGridController.resetVal("resPlanHours", "0");
            ResourcePlanGridController.resetVal("resPlanRate", "0");
            ResourcePlanGridController.resetVal("resPlanCost", "0");
            ResourcePlanGridController.resetVal("resPlanCapacity", "0");
            ResourcePlanGridController.resetVal("resPlanFTE", "");
        } else {
            $("#resPlanAddFormTitle").html("Edit Item");
        }
    });

    ResourcePlanGridController.uoMCombobox = $("#resPlanUoMFilter");
    ResourcePlanGridController.startDateChooser = $("#resPlanFilterStartDate");
    ResourcePlanGridController.endDateChooser = $("#resPlanFilterEndDate");

    ResourcePlanGridController.grid.addEventListener(ResourcePlanGridController, "PagerEventsAdded", function (event) {
        ResourcePlanGridController.grid.dispatchEvent(new flexiciousNmsp.BaseEvent("ShowEditDeleteButtons"));
        ResourcePlanGridController.grid.dispatchEvent(new flexiciousNmsp.BaseEvent("DisableEditDeleteButtons"));
    });
};

ResourcePlanGridController.onFilterPageSortChange = function (event) {
    if (event.cause == flexiciousNmsp.ExtendedFilterPageSortChangeEvent.FILTER_CHANGE) {
        ResourcePlanGridController.projectFilter = ResourcePlanGridController.grid.getFilterValue("Title");
        ResourcePlanGridController.roleFilter = ResourcePlanGridController.grid.getFilterValue("Role");
        ResourcePlanGridController.resourceFilter = ResourcePlanGridController.grid.getFilterValue("Name1");
        ResourcePlanGridController.filterAndApplyData();
    }
};

ResourcePlanGridController.isEditDeleteActive = false;
ResourcePlanGridController.onItemClick = function (event) {
    var item = event.item;
    if (!item) {
        if (ResourcePlanGridController.isEditDeleteActive) {
            ResourcePlanGridController.grid.dispatchEvent(new flexiciousNmsp.BaseEvent("DisableEditDeleteButtons"));
            ResourcePlanGridController.isEditDeleteActive = false;
        }
        return;
    }
    var col = event.column;
    if (!col) {
        if (ResourcePlanGridController.isEditDeleteActive) {
            ResourcePlanGridController.grid.dispatchEvent(new flexiciousNmsp.BaseEvent("DisableEditDeleteButtons"));
            ResourcePlanGridController.isEditDeleteActive = false;
        }
        return;
    }
    var dataField = col.getDataField();
    if (dataField.indexOf(".") != -1) {
        dataField = dataField.split(".")[0];
    }
    var val = flexiciousNmsp.UIUtils.resolveExpression(item, dataField);
    if (!val || !val.data) {
        if (ResourcePlanGridController.isEditDeleteActive) {
            ResourcePlanGridController.grid.dispatchEvent(new flexiciousNmsp.BaseEvent("DisableEditDeleteButtons"));
            ResourcePlanGridController.isEditDeleteActive = false;
        }
        return;
    }
    ResourcePlanGridController.selectedItem = val.data;
    if (!ResourcePlanGridController.isEditDeleteActive) {
        ResourcePlanGridController.grid.dispatchEvent(new flexiciousNmsp.BaseEvent("EnableEditDeleteButtons"));
        ResourcePlanGridController.isEditDeleteActive = true;
    }
};

ResourcePlanGridController.filterAndApplyData = function () {
    var dp = ResourcePlanGridController._cachedLastRangeData;
    dp = JSON.parse(JSON.stringify(dp));
    var qulifiedItems = [];
    for (var i = 0; i < dp.length; i++) {
        var data = dp[i];
        if (ResourcePlanGridController.projectFilter && data.Title && data.Title.indexOf(ResourcePlanGridController.projectFilter) == -1) continue;
        if (ResourcePlanGridController.roleFilter && data.Role && data.Role.indexOf(ResourcePlanGridController.roleFilter) == -1) continue;
        if (ResourcePlanGridController.resourceFilter && data.Name1 && data.Name1.indexOf(ResourcePlanGridController.resourceFilter) == -1) continue;
        qulifiedItems.push(data);
    }
    var currentLevel = ResourcePlanGridController.grid._currentExpandLevel;
    ResourcePlanGridController.grid.setDataProvider(ResourcePlanGridController.groupData(qulifiedItems));
    ResourcePlanGridController.grid.expandToLevel(currentLevel);
};


ResourcePlanGridController.resetVal = function (id, val) {
    $("#" + id).val(val);
};

ResourcePlanGridController.updateItem = function () {
    var selectedItem = ResourcePlanGridController.selectedItem; // selected item will update on the cell click;
    $('#resPlanAddForm').modal('show');
    ResourcePlanGridController.resetVal("resPlanProjectText", selectedItem.Title);
    $("#resPlanGwRoleCombo").val(selectedItem.gwRole);
    $("#resPlanGwRoleCombo").selectpicker("refresh");
    ResourcePlanGridController.resetVal("resPlanRoleText", selectedItem.Role);
    ResourcePlanGridController.resetVal("resPlanResNameText", selectedItem.Name1);
    ResourcePlanGridController.resetVal("resPlanYear", selectedItem.Year);
    ResourcePlanGridController.resetVal("resPlanMonthNum", selectedItem.MonthNum);
    ResourcePlanGridController.resetVal("resPlanMonthName", selectedItem.MonthName);
    ResourcePlanGridController.resetVal("resPlanHours", selectedItem.Hours);
    ResourcePlanGridController.resetVal("resPlanRate", selectedItem.Rate);
    ResourcePlanGridController.resetVal("resPlanCost", selectedItem.Cost);
    ResourcePlanGridController.resetVal("resPlanCapacity", selectedItem.Capacity);
    ResourcePlanGridController.resetVal("resPlanFTE", selectedItem.FTE);
};

ResourcePlanGridController.saveItem = function () {
    if (!ResourcePlanGridController.validateForm())
        return;

    var isCreate = ResourcePlanGridController.selectedItem == null;
    var item = {};
    item.__metadata = {
        "type": "SP.Data.Resource_x0020_PlanListItem"
    };
    item.Title = $("#resPlanProjectText").val();
    item.gwRole = $("#resPlanGwRoleCombo").val();
    item.Role = $("#resPlanRoleText").val();
    item.Name1 = $("#resPlanResNameText").val();
    item.Year = ($("#resPlanYear").val());
    item.MonthNum = parseInt($("#resPlanMonthNum").val());
    item.MonthName = $("#resPlanMonthName").val();
    item.Rate = parseInt($("#resPlanRate").val());
    item.Cost = parseInt($("#resPlanCost").val());
    item.Hours = parseInt($("#resPlanHours").val());
    item.Capacity = parseFloat($("#resPlanCapacity").val());
    item.FTE = parseInt($("#resPlanFTE").val());

    function success(res) {
        $("#resPlanAddForm").modal('hide');
        ResourcePlanGridController.fetchAllData();
    }

    function error(err) {
        $("#resPlanErrorMessage").html("Error occurred while saving item");
    }

    if (isCreate) {
        Service.addItem(GridConfig.ResourcePlanServiceAbsoluteUrl, item, success, error);
    } else {
        Service.updateItem(GridConfig.ResourcePlanServiceAbsoluteUrl, item, ResourcePlanGridController.selectedItem.__metadata.etag, ResourcePlanGridController.selectedItem.Id, success, error);
    }
};

ResourcePlanGridController.deleteItem = function () {
    Service.deleteItem(GridConfig.ResourcePlanServiceAbsoluteUrl, ResourcePlanGridController.selectedItem, function (res) {
        ResourcePlanGridController.fetchAllData();
        alert("deleted successfully")
    }, function (err) {
        console.log(err);
        alert("failed to delete")
    });
};


ResourcePlanGridController.validateForm = function () {
    if (!$("#resPlanProjectText").val()) {
        alert("Project Name is require");
        return false;
    }
    return true;
};

ResourcePlanGridController.getFixedColumns = function () {
    return [
        ResourcePlanGridController.generateColumn("Title", "Project", null, null, "TextInput", "Contains", null, null, "left"),
        ResourcePlanGridController.generateColumn("Role", "Role", null, null, "TextInput", "Contains", null, null, "left"),
        ResourcePlanGridController.generateColumn("Name1", "Resource", null, null, "TextInput", "Contains", null, null, "left"),
        ResourcePlanGridController.generateColumn("UofM", "UofM", null, 100, null, null, null, null, "left")
        //ResourcePlanGridController.generateColumn("", "Edit/Delete", null, 150, null, null,null, new flexiciousNmsp.ClassFactory(GridController.EditDeleteRenderer), "left")
    ]
};

ResourcePlanGridController.generateColumn = function (dateField, headerText, textAlign, width, filterControl, filterOperation, labelFunction, itemRenderer, lockMode, footerAlign, footerFunction) {
    var col = new flexiciousNmsp.FlexDataGridColumn();
    if (dateField)
        col.setDataField(dateField);
    col.setHeaderText(headerText);
    //col.setUniqueIdentifier(dateField);
    col.textAlign = !textAlign ? "left" : textAlign;
    col.setWidth(!width ? 150 : width);
    if (!(filterControl === null)) {
        col.setFilterControl(!filterControl ? "TextInput" : filterControl);
        col.filterOperation = !filterOperation ? "Contains" : filterOperation;
    }
    if (col.getFilterControl() == "TextInput") {
        col.filterTriggerEvent = "enterKeyUpOrFocusOut";
        col.enableFilterAutoComplete = true;
    }
    if (labelFunction)
        col.setLabelFunction(labelFunction);
    if (itemRenderer)
        col.itemRenderer = itemRenderer;
    if (lockMode)
        col.setColumnLockMode(lockMode);
    if (footerAlign)
        col.footerAlign = footerAlign;
    if (footerFunction)
        col.footerLabelFunction = footerFunction;
    return col;
};

ResourcePlanGridController.buildColumnFromData = function (flat) {
    // to build the top level column group
    var groupByYear = Utils.groupBy(flat, "Year");
    var yearColGroups = [];
    Utils.sortByYear(groupByYear, "Year");
    for (var i = 0; i < groupByYear.length; i++) {
        var yearColGroup = new flexiciousNmsp.FlexDataGridColumnGroup();
        yearColGroup.setHeaderText(groupByYear[i].Year);
        var groupByMonth = Utils.groupBy(groupByYear[i].children, "MonthName");
        Utils.sortByMonth(groupByMonth, "MonthName");
        var monthColGroups = [];
        for (var j = 0; j < groupByMonth.length; j++) {
            var monthColGroup = new flexiciousNmsp.FlexDataGridColumnGroup();
            monthColGroup.setHeaderText(groupByMonth[j].MonthName);
            var qtyCol = ResourcePlanGridController.generateColumn("qty" + groupByMonth[j].MonthName + groupByYear[i].Year + ".label", "Qty", "right", 90, null, null, ResourcePlanGridController.labelFunction, null, null, "right", ResourcePlanGridController.footerLabelFunction);
            qtyCol.setUniqueIdentifier(groupByYear[i].Year + " - " + groupByMonth[j].MonthName + " - " + "Qty");
            var costCol = ResourcePlanGridController.generateColumn("cost" + groupByMonth[j].MonthName + groupByYear[i].Year + ".label", "Cost", "right", 90, null, null, ResourcePlanGridController.labelFunction, null, null, "right", ResourcePlanGridController.footerLabelFunction);
            costCol.setUniqueIdentifier(groupByYear[i].Year + " - " + groupByMonth[j].MonthName + " - " + "Cost");
            qtyCol.footerOperation = costCol.footerOperation = "sum";
            costCol.footerLabel = "$ ";
            monthColGroup.setColumns([
                qtyCol, costCol
            ]);
            monthColGroups.push(monthColGroup);
        }
        yearColGroups.push(yearColGroup);
        yearColGroup.columnGroups = monthColGroups;
    }
    var fixedColumns = ResourcePlanGridController.getFixedColumns();
    for (var i = 0; i < yearColGroups.length; i++) {
        fixedColumns.push(yearColGroups[i]);
    }
    fixedColumns.push(ResourcePlanGridController.getPaddingColumn());
    ResourcePlanGridController.grid.setGroupedColumns(fixedColumns);

};


ResourcePlanGridController.paddingColumn = null;
ResourcePlanGridController.getPaddingColumn = function () {
    if (ResourcePlanGridController.paddingColumn == null) {
        var col = new flexiciousNmsp.FlexDataGridColumn();
        col.setHeaderText("");
        col.excludeFromExport = true;
        col.excludeFromPrint = true;
        col.excludeFromSettings = true;
        col.sortable = false;
        col.setWidth(10);
        ResourcePlanGridController.paddingColumn = col;
    }
    return ResourcePlanGridController.paddingColumn;
};

ResourcePlanGridController.footerLabelFunction = function (column) {
    var sum = flexiciousNmsp.UIUtils.sum(ResourcePlanGridController.grid.getDataProvider(), column.getDataField());
    if (column.getDataField().indexOf("qty") == 0) {
        return sum ? parseFloat(sum.toFixed(1)).toLocaleString().indexOf(".") == -1 ? parseFloat(sum.toFixed(1)).toLocaleString()+".0" : parseFloat(sum.toFixed(1)).toLocaleString() : 0;
    } else {
        return "$" + (sum ? parseInt(sum).toLocaleString() : 0);
    }
};

ResourcePlanGridController.labelFunction = function (dp, column) {
    var num = flexiciousNmsp.UIUtils.resolveExpression(dp, column.getDataField());
    if (column.getDataField().indexOf("qty") == 0) {
        return num ? parseFloat(num.toFixed(1)).toLocaleString().indexOf(".") == -1 ? parseFloat(num.toFixed(1)).toLocaleString() + ".0" : parseFloat(num.toFixed(1)).toLocaleString() : "";
    } else {
        return (num ? "$" + parseInt(num).toLocaleString() : "");
    }
};


ResourcePlanGridController.firstLoad = false;
ResourcePlanGridController.fetchAllData = function () {
    Service.get(GridConfig.ResourcePlanServiceAbsoluteUrl, "$orderby=Title asc&$Top=1000", undefined, function (res) {
        var dp = res.d.results;
        ResourcePlanGridController.flatDataProviderBackup = JSON.parse(JSON.stringify(dp));
        ResourcePlanGridController.updateFilterValues();
        var filteredFlat = ResourcePlanGridController._cachedLastRangeData = ResourcePlanGridController.getCurrentRangeFlatData();
        var prevExpandedLevel = ResourcePlanGridController.grid._currentExpandLevel;
        ResourcePlanGridController.buildColumnFromData(filteredFlat);
        ResourcePlanGridController.grid.setDataProvider(ResourcePlanGridController.groupData(dp));
        ResourcePlanGridController.filterAndApplyData();
        ResourcePlanGridController.grid.validateNow();
        ResourcePlanGridController.grid.expandToLevel(prevExpandedLevel);
        if (!ResourcePlanGridController.firstLoad) {
            ResourcePlanGridController.firstLoad = false;
            ResourcePlanGridController.installFilterControlsListeners();
            ResourcePlanGridController.grid.getBodyContainer().checkScrollChange();
        }
    }, function (err) {
        alert("Error occur on the Resource Plan grid service, please check login session established");
    });
};


ResourcePlanGridController.updateFilterValues = function () {
    var dp = ResourcePlanGridController.flatDataProviderBackup;
    var minMaxObjects = ResourcePlanGridController.findMinMaxDateObjects(dp);
    var minDateObject = minMaxObjects[0];
    var maxDateObject = minMaxObjects[1];

    var prevStartDate = ResourcePlanGridController.startDateChooser.val();
    var prevEndDate = ResourcePlanGridController.endDateChooser.val();

    //ResourcePlanGridController.startDateChooser.datepicker("update", !prevStartDate ? minDateObject.MonthName+"-"+minDateObject.Year : prevStartDate);
    //ResourcePlanGridController.startDateChooser.datepicker("setDate", new Date(parseInt(minDateObject.Year), Utils.ALL_MONTHS.indexOf(minDateObject.MonthName,1)));
    ResourcePlanGridController.startDateChooser.val(!prevStartDate ? minDateObject.MonthName + "-" + minDateObject.Year : prevStartDate);
    ResourcePlanGridController.startDateChooser.datepicker("setStartDate", new Date(parseInt(minDateObject.Year), Utils.ALL_MONTHS.indexOf(minDateObject.MonthName), 1));
    ResourcePlanGridController.startDateChooser.datepicker("setEndDate", new Date(parseInt(maxDateObject.Year), Utils.ALL_MONTHS.indexOf(maxDateObject.MonthName), 1));

    //ResourcePlanGridController.endDateChooser.datepicker("update", !prevEndDate ? maxDateObject.MonthName+"-"+maxDateObject.Year : prevEndDate);
    ResourcePlanGridController.endDateChooser.val(!prevEndDate ? maxDateObject.MonthName + "-" + maxDateObject.Year : prevEndDate);
    //  ResourcePlanGridController.endDateChooser.datepicker("setDate", new Date(parseInt(maxDateObject.Year), Utils.ALL_MONTHS.indexOf(maxDateObject.MonthName,1)));
    ResourcePlanGridController.endDateChooser.datepicker("setStartDate", new Date(parseInt(minDateObject.Year), Utils.ALL_MONTHS.indexOf(minDateObject.MonthName), 1));
    ResourcePlanGridController.endDateChooser.datepicker("setEndDate", new Date(parseInt(maxDateObject.Year), Utils.ALL_MONTHS.indexOf(maxDateObject.MonthName), 1));

};


/**
 *
 * @param flat
 * @return {Array}  contain two element, Index 0 - lowest date object, Index 1 - highest date object
 */
ResourcePlanGridController.findMinMaxDateObjects = function (flat) {
    var minDateObject = null;
    var maxDateObject = null;
    if (!flat || !flat.length)
        return [minDateObject, maxDateObject];
    minDateObject = maxDateObject = flat[0];
    for (var i = 1; i < flat.length; i++) {
        var object = flat[i];
        if (ResourcePlanGridController.isGraterThan(object, maxDateObject))
            maxDateObject = object;
        if (ResourcePlanGridController.isLessThan(object, minDateObject))
            minDateObject = object;
    }
    return [minDateObject, maxDateObject];
};

ResourcePlanGridController.isGraterThan = function (item, compareWith, equals) {
    var itemMonthIndex = Utils.ALL_MONTHS.indexOf(item.MonthName);
    var comparedWithMonthIndex = Utils.ALL_MONTHS.indexOf(compareWith.MonthName);
    if (parseInt(item.Year) < parseInt(compareWith.Year))
        return false;
    if (parseInt(item.Year) > parseInt(compareWith.Year))
        return true;
    else
        return equals ? itemMonthIndex >= comparedWithMonthIndex : itemMonthIndex > comparedWithMonthIndex;
};

ResourcePlanGridController.isLessThan = function (item, compareWith, equals) {
    var itemMonthIndex = Utils.ALL_MONTHS.indexOf(item.MonthName);
    var comparedWithMonthIndex = Utils.ALL_MONTHS.indexOf(compareWith.MonthName);
    if (parseInt(item.Year) > parseInt(compareWith.Year))
        return false;
    if (parseInt(item.Year) < parseInt(compareWith.Year))
        return true;
    else
        return equals ? itemMonthIndex <= comparedWithMonthIndex : itemMonthIndex < comparedWithMonthIndex;
};


ResourcePlanGridController.groupData = function (flat) {
    if (!flat)
        return [];

    var availableMonthsPattern, child, v, x, y;
    var projectsToRemove = [];
    var groupedByProject = Utils.groupBy(flat, "Title");
    for (var i = 0; i < groupedByProject.length; i++) {
        var project = groupedByProject[i];
        var groupedByRole = Utils.groupBy(project.children, "Role");
        var rolesToRemove = [];
        for (var j = 0; j < groupedByRole.length; j++) {
            var role = groupedByRole[j];
            var roleChildren = [];
            for (var k = 0; k < role.children.length; k++) {
                child = role.children[k];
                var obj = {};
                obj["Name1"] = child["Name1"];
                obj["qty" + child.MonthName + child.Year] = {
                    label: child[ResourcePlanGridController.uoMSelectedItem] ? child[ResourcePlanGridController.uoMSelectedItem] : 0,
                    data: child
                };
                obj["cost" + child.MonthName + child.Year] = {label: child["Cost"] ? child["Cost"] : 0, data: child};
                if (obj["qty" + child.MonthName + child.Year].label || obj["cost" + child.MonthName + child.Year].label)
                    roleChildren.push(obj);
            }
            var temp = [];
            availableMonthsPattern = [];
            var groupedByResource = Utils.groupBy(roleChildren, "Name1");
            for (var ix = 0; ix < groupedByResource.length; ix++) {
                var item = groupedByResource[ix];
                item["UofM"] = ResourcePlanGridController.uoMSelectedItem;
                for (var iy = 0; iy < item.children.length; iy++) {
                    for (var prop in item.children[iy]) {
                        if (prop == "Name1")
                            continue;
                        if (!item.hasOwnProperty(prop))
                            item[prop] = item.children[iy][prop];
                        else
                            item[prop].label += item.children[iy][prop].label;
                        prop = prop.replace("qty", "").replace("cost", "");
                        if (availableMonthsPattern.indexOf(prop) == -1)
                            availableMonthsPattern.push(prop);
                    }
                }
                temp.push(item);
                delete item.children;
            }
            role.children = roleChildren = temp;
            if (!role.children.length)
                rolesToRemove.push(role);
            for (x = 0; x < availableMonthsPattern.length; x++) {
                role["qty" + availableMonthsPattern[x]] = {label: 0};
                role["cost" + availableMonthsPattern[x]] = {label: 0};
                for (y = 0; y < roleChildren.length; y++) {
                    child = roleChildren[y];
                    if (child.hasOwnProperty("qty" + availableMonthsPattern[x])) {
                        role["qty" + availableMonthsPattern[x]].label += child["qty" + availableMonthsPattern[x]].label;
                        role["cost" + availableMonthsPattern[x]].label += child["cost" + availableMonthsPattern[x]].label;
                    }
                }
            }
            role.availableMonthPattern = availableMonthsPattern; // role up the lower level available month info
        }
        for (var t = 0; t < rolesToRemove.length; t++)
            groupedByRole.splice(groupedByRole.indexOf(rolesToRemove[t]), 1);
        project.children = groupedByRole;
        if (!groupedByRole.length)
            projectsToRemove.push(project);
        availableMonthsPattern = [];
        for (v = 0; v < groupedByRole.length; v++) {
            child = groupedByRole[v];
            for (var m = 0; m < child.availableMonthPattern.length; m++) {
                if (availableMonthsPattern.indexOf(child.availableMonthPattern[m]) == -1)
                    availableMonthsPattern.push(child.availableMonthPattern[m]);
            }
        }
        for (x = 0; x < availableMonthsPattern.length; x++) {
            project["qty" + availableMonthsPattern[x]] = {label: 0};
            project["cost" + availableMonthsPattern[x]] = {label: 0};
            for (y = 0; y < groupedByRole.length; y++) {
                child = groupedByRole[y];
                if (child.hasOwnProperty("qty" + availableMonthsPattern[x]))
                    project["qty" + availableMonthsPattern[x]].label += child["qty" + availableMonthsPattern[x]].label;
                if (child.hasOwnProperty("cost" + availableMonthsPattern[x]))
                    project["cost" + availableMonthsPattern[x]].label += child["cost" + availableMonthsPattern[x]].label;
            }
        }
    }
    for (var q = 0; q < projectsToRemove.length; q++)
        groupedByProject.splice(groupedByProject.indexOf(projectsToRemove[q]), 1);
    return groupedByProject;
};


ResourcePlanGridController.installFilterControlsListeners = function () {
    ResourcePlanGridController.startDateChooser.datepicker().on("changeDate", ResourcePlanGridController.onDateChooserChange);
    ResourcePlanGridController.endDateChooser.datepicker().on("changeDate", ResourcePlanGridController.onDateChooserChange);
    ResourcePlanGridController.uoMCombobox.on("change", ResourcePlanGridController.onUoMChooserChange);
};

ResourcePlanGridController.unInstallFilterControlsListeners = function () {
    ResourcePlanGridController.startDateChooser.datepicker().off("changeDate", ResourcePlanGridController.onDateChooserChange);
    ResourcePlanGridController.endDateChooser.datepicker().off("changeDate", ResourcePlanGridController.onDateChooserChange);
    ResourcePlanGridController.uoMCombobox.off("change", ResourcePlanGridController.onUoMChooserChange);
};


ResourcePlanGridController._cachedLastRangeData = null;

ResourcePlanGridController.onDateChooserChange = function (event) {
    var filteredFlat = ResourcePlanGridController._cachedLastRangeData = ResourcePlanGridController.getCurrentRangeFlatData();
    if (!filteredFlat)
        return;
    ResourcePlanGridController.grid.clearFilter();
    ResourcePlanGridController.buildColumnFromData(filteredFlat);
    ResourcePlanGridController.grid.setDataProvider(ResourcePlanGridController.groupData(filteredFlat));
    // ResourcePlanGridController.grid.expandToLevel(1);
};

ResourcePlanGridController.onUoMChooserChange = function (event) {
    ResourcePlanGridController.uoMSelectedItem = ResourcePlanGridController.uoMCombobox.find("option:selected").val();
    if (!ResourcePlanGridController.uoMSelectedItem)
        ResourcePlanGridController.uoMSelectedItem = "Hours";
    if (!ResourcePlanGridController._cachedLastRangeData)
        ResourcePlanGridController._cachedLastRangeData = ResourcePlanGridController.flatDataProviderBackup;
    ResourcePlanGridController.grid.clearFilter();
    ResourcePlanGridController.grid.setDataProvider(ResourcePlanGridController.groupData(ResourcePlanGridController._cachedLastRangeData));
    ResourcePlanGridController.grid.expandToLevel(1);
};


ResourcePlanGridController.getCurrentRangeFlatData = function () {
    var startDateString = ResourcePlanGridController.startDateChooser.val();
    if (!startDateString) {
        alert("please select start date to proceed");
        return;
    }

    var endDateString = ResourcePlanGridController.endDateChooser.val();
    if (!endDateString) {
        alert("please select start date to proceed");
        return;
    }

    if (!(ResourcePlanGridController.isLessThan({
                MonthName: startDateString.split("-")[0],
                Year: startDateString.split("-")[1]
            },
            {MonthName: endDateString.split("-")[0], Year: endDateString.split("-")[1]},
            true))) {
        alert("Start Date must be less than End Date");
        return;
    }

    return ResourcePlanGridController.getRangedData(startDateString, endDateString);
}

/**
 *
 * @param startDateString
 * @param endDateString
 * @return {Array}
 *
 * date should be in MM-yyyy : ex - January-2015
 */
ResourcePlanGridController.getRangedData = function (startDateString, endDateString) {
    var qualifiedDatum = [];
    var dp = ResourcePlanGridController.flatDataProviderBackup;
    var startObj = {MonthName: startDateString.split("-")[0], Year: startDateString.split("-")[1]};
    var endObj = {MonthName: endDateString.split("-")[0], Year: endDateString.split("-")[1]};
    for (var i = 0; i < dp.length; i++) {
        if (ResourcePlanGridController.isGraterThan(dp[i], startObj, true) && ResourcePlanGridController.isLessThan(dp[i], endObj, true))
            qualifiedDatum.push(dp[i]);
    }
    return qualifiedDatum;
};
