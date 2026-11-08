sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "zprogmini/model/formatter"
], (Controller,JSONModel, formatter) => {
    "use strict";

    return Controller.extend("zprogmini.controller.Detail", {
        formatter : formatter,
        
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("RouteDetail")
            .attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched : function(oEvent){      
            console.log("==========_onPatternMatched==========");
            const oModel = this.getOwnerComponent().getModel();

            const sRestaurantId = oEvent.getParameter("arguments").paramOrder;
            const aRestaurants = oModel.getProperty("/Restaurant");

            const iRestaurantId = Number(sRestaurantId);

            const iIndex = aRestaurants.findIndex(
                 (oItem) => oItem.id === iRestaurantId
            );

            const sPath = `/Restaurant/${iIndex}`
            //@TODO: id 수정, ObjectPageLayout -> idObjectPageLayout으로 수정
            this.byId("ObjectPageLayout").bindElement(sPath);

            //전역으로 된 review 모델 가져옴
            let reModel = this.getOwnerComponent().getModel("review").getProperty("/Review");

             let reviewFind = reModel.filter(function(sItem){
                return sItem.id === iIndex
             })
             let newReview = new JSONModel(reviewFind)
             this.getView().setModel(newReview,"detailReview");

             const ab =  this.getView().getModel("detailReview").getData();
             console.log(ab);
        },

        backNav : function(){
            const oRouter = this.getOwnerComponent().getRouter();

            // Router 중에서, RouterDetail로 이동
            oRouter.navTo("RouteMain");
        },


        // 찜하기
        onPressFavorite(){

        },


        // 공유하기
        onPressShare(){

        }
    });
});