sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("zprogmini.controller.Detail", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("RouteDetail")
            .attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched : function(oEvent){      
            const oModel = this.getOwnerComponent().getModel();

            const sRestaurantId = +oEvent.getParameter("arguments").paramOrder;
            const aRestaurants = oModel.getProperty("/Restaurant");

            const iIndex = aRestaurants.findIndex(
                 (oItem) => oItem.id === sRestaurantId
            );


            const sPath = `/Restaurant/${iIndex}`
            //@TODO: id 수정, ObjectPageLayout -> idObjectPageLayout으로 수정
            this.byId("ObjectPageLayout").bindElement(sPath);

        },

        backNav : function(){
            const oRouter = this.getOwnerComponent().getRouter();

            // Router 중에서, RouterDetail로 이동
            oRouter.navTo("RouteMain");
        }
    });
});