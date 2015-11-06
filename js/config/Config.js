/**
 * Created by 19.06.2013-7pm on 09-Oct-15.
 */

var GridConfig = window.GridConfig = {};

// url stuffs
GridConfig.ServiceBaseUrl = "http://psch.mspshosting.com/PWA/_api/";
GridConfig.CostServiceRelativeUrl = "web/lists/getbytitle('Cost')/Items";
GridConfig.CostServiceAbsoluteUrl = GridConfig.ServiceBaseUrl +  GridConfig.CostServiceRelativeUrl;
GridConfig.ResourcePlanServiceRelativeUrl = "web/lists/getbytitle('Resource Plan')/Items";
GridConfig.ResourcePlanServiceAbsoluteUrl= GridConfig.ServiceBaseUrl + GridConfig.ResourcePlanServiceRelativeUrl;

// config grid xml stuff
GridConfig.GridXmlConfig = {};
GridConfig.GridXmlConfig.CostGrid = '<grid useEnhancedPrint="false" ' +
                                'height="100%" ' +
                                'width="100%" ' +
                                'enablePrint="true" ' +
                                'enableExport="true" ' +
                                'enablePdf="false" ' +
                                'forcePagerRow="true" ' +
                                'enableFilters="true" ' +
                                'pagerRowHeight = "35" ' +
                                'rowHeight = "25" ' +
                                'horizontalScrollPolicy="auto" ' +
                                'showSpinnerOnFilterPageSort="false" ' +
                                'enableDrillDown = "true" ' +
                                'nestIndent="36" ' +
                                'enableHideIfNoChildren="true" '+
                                'pagerRenderer="GridController.pagerControl" '+
                                'enableFooters="true" ' +
                                'enableMultiColumnSort="true" ' +
                                'enableColumnHeaderOperation="true" ' +
                                'filterPageSortChange="CostGridController.onFilterPageSortChange" '+
                                'creationComplete = "CostGridController.onCreationComplete" '+
                                'selectionMode="multipleRows"> ' +
                                    '<level headerHeight="30" childrenField="children">' +
                                        '<columns>' +
                                            '<column dataField="Level1" textAlign="left" headerText="Level1" width="200" filterControl="TextInput"  filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut" enableFilterAutoComplete="true"/>' +
                                            '<column dataField="Level2" textAlign="left" headerText="Level2" filterControl="TextInput" filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut"  width="200" />' +
                                            '<column dataField="Title"  textAlign="left" headerText="Title" filterControl="TextInput" filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut"  width="200" />' +
                                            '<column dataField="Project_x0020_Name" textAlign="left" headerText="Project Name" filterComboBoxBuildFromGrid="true" filterControl="MultiSelectComboBox"  width="200" />' +
                                            '<column dataField="Year1" textAlign="right" footerLabelFunction="CostGridController.yearAndTotalFooterColumnLabelFunction" labelFunction="CostGridController.yearColumnLabelFunction" headerText="2015" footerOperation="sum" width="200" />' +
                                            '<column dataField="Year2" textAlign="right" footerLabelFunction="CostGridController.yearAndTotalFooterColumnLabelFunction" labelFunction="CostGridController.yearColumnLabelFunction" headerText="2016" footerOperation="sum" filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut"   width="100" />' +
                                            '<column dataField="Year3" textAlign="right" footerLabelFunction="CostGridController.yearAndTotalFooterColumnLabelFunction" labelFunction="CostGridController.yearColumnLabelFunction" headerText="2017" footerOperation="sum" filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut"   width="100" />' +
                                            '<column dataField="Year4" textAlign="right" footerLabelFunction="CostGridController.yearAndTotalFooterColumnLabelFunction" labelFunction="CostGridController.yearColumnLabelFunction" headerText="2018" footerOperation="sum" filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut"   width="100" />' +
                                            '<column dataField="Year5" textAlign="right" footerLabelFunction="CostGridController.yearAndTotalFooterColumnLabelFunction" labelFunction="CostGridController.yearColumnLabelFunction" headerText="2019" footerOperation="sum" filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut"   width="100" />' +
                                            '<column dataField="total" textAlign="right" footerLabelFunction="CostGridController.yearAndTotalFooterColumnLabelFunction" labelFunction="CostGridController.yearColumnLabelFunction" headerText="Total" footerOperation="sum" filterOperation="Contains" filterTriggerEvent="enterKeyUpOrFocusOut"   width="100" />' +
                                            '<column itemRenderer="GridController.EditDeleteRenderer" headerText="Edit Delete" excludeFromPrint="true" excludeFromExport="true"></column>' +
                                        '</columns>' +
                                        '<nextLevel>' +
                                            '<level nestIndent="36" headerHeight="35" reusePreviousLevelColumns="true" rowHeight="25" childrenField="children" filterVisible="false" >' +
                                                '<nextLevel>' +
                                                    '<level nestIndent="36" headerHeight="35" reusePreviousLevelColumns="true" rowHeight="25" childrenField="children" filterVisible="false" />'  +
                                                '</nextLevel>' +
                                            '</level>' +
                                        '</nextLevel>' +
                                    '</level>' +
                                '</grid>';


GridConfig.GridXmlConfig.ResourcePlanGrid = '<grid useEnhancedPrint="false" ' +
                                                'height="100%" ' +
                                                'width="100%" ' +
                                                'enablePrint="true" ' +
                                                'enableExport="true" ' +
                                                'enableHeightAutoAdjust="true" '+
                                                'enablePdf="false" ' +
                                                'forcePagerRow="true" ' +
                                                'enableFilters="false" ' +
                                                'pagerRowHeight = "35" ' +
                                                'rowHeight = "25" ' +
                                                'horizontalScrollPolicy="auto" ' +
                                                'showSpinnerOnFilterPageSort="false" ' +
                                                'enableDrillDown = "true" ' +
                                                'nestIndent="36" ' +
                                                'displayOrder="pager,header,footer,filter,body" '+
                                                'pagerRenderer="GridController.pagerControl" '+
                                                'enableFooters="true" ' +
                                                'enableMultiColumnSort="true" ' +
                                                'enableColumnHeaderOperation="true" ' +
                                                'filterPageSortChange="ResourcePlanGridController.onFilterPageSortChange" '+
                                                'creationComplete = "ResourcePlanGridController.onCreationComplete" '+
                                                'itemClick = "ResourcePlanGridController.onItemClick" '+
                                                'selectionMode="singleCell"> ' +
                                                '<level headerHeight="30" childrenField="children" enableFilters="false">' +
                                                        '<nextLevel>' +
                                                            '<level nestIndent="36" headerHeight="35" reusePreviousLevelColumns="true" rowHeight="25" childrenField="children" filterVisible="false" >' +
                                                                '<nextLevel>' +
                                                                  '<level nestIndent="36" headerHeight="35" reusePreviousLevelColumns="true" rowHeight="25" childrenField="children" filterVisible="false" />'  +
                                                                '</nextLevel>' +
                                                            '</level>' +
                                                        '</nextLevel>' +
                                                '</level>' +
                                            '</grid>';
