sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("zprogmini.controller.Detail", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("RouteDetail")
            .attachPatternMatched(this._MenuRiew, this);
        },

        _MenuRiew : function(oEvent){      
            console.log("========_MenuRiew========");
            // menu.json > restaurant.json으로 변경 및 manifest.json에서 전역 데이터모델로 대체
            // let oModel = new JSONModel();
            // let tModel = oModel.loadData("../model/menu.json",{},false);

            // this.getView().getModel(tModel);
            // 전역 모델로 대체
            let oModel = this.getOwnerComponent().getModel();

            let oId = oEvent.getParameter("arguments").paramOrder;
            let FindID = oModel.getProperty("/Restaurant");

            console.log(oId);
            console.log(FindID);

            let IdFind = FindID.find(function(oItem){
                console.log(oItem.id);
                return oItem.id == oId;
            })

            console.log(IdFind);

            let sModel = new JSONModel(IdFind);
            this.getView().setModel(sModel,"Menu");

        },

        backNav : function(){
            const oRouter = this.getOwnerComponent().getRouter();

            // Router 중에서, RouterDetail로 이동
            oRouter.navTo("RouteMain");
        }
    });
});