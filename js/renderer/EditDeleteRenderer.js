/**
 * Created by 19.06.2013-7pm on 13-Oct-15.
 */

(function (window) {

    var EditDeleteRenderer = function () {
        flexiciousNmsp.UIComponent.apply(this, ["div"]);
        this.domElement.style.display = "table-cell";
        this.domElement.style.width = "100%";
        this.domElement.style.textAlign = "center";
        this.domElement.style.verticalAlign = "middle";

        var editButton = new flexiciousNmsp.UIComponent("button");
        editButton.domElement.className = "btn btn-default btn-xs";
        editButton.domElement.innerHTML = "Edit";
        editButton.domElement.style.lineHeight = "1.2";
        editButton.addEventListener(this, "click", this.onEditClick);
        this.editButton = editButton;

        var deleteButton = new flexiciousNmsp.UIComponent("button");
        deleteButton.domElement.className = "btn btn-danger btn-xs";
        deleteButton.domElement.innerHTML = "Delete";
        deleteButton.domElement.style.marginLeft = "10px";
        deleteButton.domElement.style.lineHeight = "1.2";
        deleteButton.addEventListener(this, "click", this.onDeleteClick);
        this.deleteButton = deleteButton;

        this.addEventListener(this, flexiciousNmsp.Constants.EVENT_CREATION_COMPLETE, this.onCreationComplete);
    };

    GridController.EditDeleteRenderer = EditDeleteRenderer; //add to name space
    EditDeleteRenderer.prototype = new flexiciousNmsp.UIComponent("select"); //setup hierarchy
    EditDeleteRenderer.prototype.typeName = EditDeleteRenderer.typeName = 'EditDeleteRenderer';//for quick inspection
    EditDeleteRenderer.prototype.getClassNames = function () {
        return ["EditDeleteRenderer", "UIComponent"];

    };

    EditDeleteRenderer.prototype.onCreationComplete = function (event) {
        this.addChild(this.editButton);
        this.addChild(this.deleteButton);
    };

    EditDeleteRenderer.prototype.setText = function (val) {
        this._text = val;
    };

    EditDeleteRenderer.prototype.setData = function (value) {
        this.data = value;
        if (this.parent.level.getNestDepth() != 3) {
            this.editButton.domElement.style.display = "none";
            this.deleteButton.domElement.style.display = "none";
        } else {
            this.editButton.domElement.style.display = "";
            this.deleteButton.domElement.style.display = "";
        }
    };

    EditDeleteRenderer.prototype.onEditClick = function (event) {
        var controller = this.parent.getColumn().level.grid.controller;
        controller.updateItem(this.data.original);
    };

    EditDeleteRenderer.prototype.onDeleteClick = function (event) {
        if (confirm("Are you sure to delete this item..?")) {
            var controller = this.parent.getColumn().level.grid.controller;
            controller.deleteItem(this.data.original);
        }
    };

}(window));