sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter"
], (Controller,JSONModel,Filter,FilterOperator,MessageBox,Sorter) => {
    "use strict";

    return Controller.extend("zprogmini.controller.Main", {
        onInit() {
        // menu.json > restaurant.json으로 변경 및 
        // 데이터 모델은 manifest.json에서 선언함 대체
        //    let oTest = new JSONModel();

        //     // menu.json 파일 불러오기
        //     oTest.loadData("../model/menu.json");

        //     // View에 기본 모델 적용
        //     this.getView().setModel(oTest);
        
            let oDialogModel1 = new JSONModel({
                restaurantId: "",
                menuId: "",
                scope: "",
                revisitIndex: -1,
                waitingIndex: -1,
                Date: "",
                review: "",
                image: ""
            });

            this.getView().setModel(oDialogModel1, "dialog");

            // 카테고리 모델
            let oCategoriesModel = new JSONModel();
            oCategoriesModel.loadData(sap.ui.require.toUrl("zprogmini/model/category.json"));
            this.getView().setModel(oCategoriesModel, "CategoriesData");
        
            let oChart = this.byId("idScopeChart");
            oChart.setVizProperties({
            title: { text: "가게별 별점" },
            plotArea: {
                    colorPalette: ["#FFD400"],          // 막대 노랑색
                    gap: { groupSpacing: 3 },           // 막대 간격을 넓혀 두께를 절반 수준으로
                    dataLabel: { visible: true }
                    },
            valueAxis: {
                    title: { visible: false },
                    scale: { fixedRange: true, minValue: 0, maxValue: 5 },
                    label: { numberFormat: "0" }        // 0, 1, 2… 정수로 표시
                    },
            categoryAxis: { title: { visible: false } }
            });
        },

        onNavDetail: function(oEvent) {
            console.log("========oContext========");

            let aButton = oEvent.getSource().getParent();
            let oContext = aButton.getBindingContext().getObject();
            let oId = oContext.id;
            
            console.log(oContext);
            console.log(aButton);
            console.log(oId);
            console.log(oId);
            console.log(oId);
            console.log(oId);

            // let oContext = oEvent.getParameter("listItem").getBindingContext();
            // let oObject = oContext.getObject();
            // let oId = oObject.id;

            // console.log(oContext);
            // console.log(oObject);
            // console.log(oId);

            // //manifest.json에 등록된 Router 정보 가져오기
            const oRouter = this.getOwnerComponent().getRouter();
            
            //Router 중에서, RouteDetail(라우터 이름)로 이동
            oRouter.navTo("RouteDetail",{
                paramOrder : oId
                //op: "Detail"
            });

        },

        onAdd: function () {
            if (!this.pDialog) {
                this.pDialog = this.loadFragment({
                    name: "zprogmini.view.fragment.ReviewAdd"
                })
            }
            this.pDialog.then(function (oDialog) {
                oDialog.open();
            })
        },
        onCancel: function (oEvent) {
            let oCancel = oEvent.getSource();
            oCancel.getParent().close();
        
        },

        onRandom: function () {
            // Menu.json 데이터 가져오기
            var aMenu = this.getView().getModel().getProperty("/Menu");

            if (!aMenu || aMenu.length === 0) {
                sap.m.MessageToast.show("뽑을 맛집이 없어요!");
                return;
            }

            // 0 ~ (길이-1) 사이 랜덤 인덱스
            var iIndex = Math.floor(Math.random() * aMenu.length);
            var sName = aMenu[iIndex].name;

            MessageBox.information("오늘의 점심은 [" + sName + "] 어때요?", {
                title: "점메추"
            });
        },
         onpress: function () {
            if (!this.pcatDialog) {
                this.pcatDialog = this.loadFragment({
                    name: "zprogmini.view.fragment.MenuCategories"
                });
            }
            this.pcatDialog.then(function (oDialog) {
                // 열 때마다 이전 선택 해제
                oDialog.getContent()[0].removeSelections(true);
                oDialog.open();
            });
        },

        onCloseDialog: function () {
            this.pcatDialog.then(function (oDialog) {
                oDialog.close();
            });
        },
        onCategorySelect: function (oEvent) {
            // press면 getSource(), selectionChange면 listItem 파라미터
            let oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            let sCategory = oItem.getBindingContext("CategoriesData").getProperty("name");

            console.log("선택한 카테고리:", sCategory);

            let oBinding = this.byId("idProductsTable").getBinding("items");

            if (sCategory === "전체") {
                oBinding.filter([]);
            } else {
                oBinding.filter([
                    new Filter("category", FilterOperator.EQ, sCategory)
                ]);
            }

            this.onCloseDialog();
        },
        onRestaurantChange: function(oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem) {
                return;
            }

            // 선택한 식당의 BindingContext 가져오기
            let oContext = oSelectedItem.getBindingContext();

            // 선택한 식당의 데이터 객체 가져오기
            let oRestaurant = oContext.getObject();

            // 선택한 식당의 Menu 배열 가져오기
            let aMenu = oRestaurant.Menu;

            // 메뉴 ComboBox에 메뉴 데이터 적용
            let oMenuCombo = this.byId("idMenuCombo");
            let oMenuModel = new JSONModel(aMenu);

            oMenuCombo.setModel(oMenuModel);

            // 이전에 선택했던 메뉴 초기화
            this.getView().getModel("dialog").setProperty("/menuId", "");
            },

        onSave: function(oEvent) {
            let oModel = this.getView().getModel();
            let oData = this.getView().getModel("dialog").getData();

            // 기존 Review 배열 가져오기
            let aReview = oModel.getProperty("/Review");

            // 새로운 Review 객체 만들기
            let oNewReview = {
                id: Math.max(0, ...aReview.map(item => item.id)) + 1,
                date: oData.Date,
                menuId: Number(oData.menuId),
                revisit: oData.revisitIndex === 0,
                waiting: oData.waitingIndex === 0,
                scope: Number(oData.scope),
                content: oData.review,
                imgUrl: oData.image
            };

            // 기존 Review 배열에 새로운 리뷰 추가
            aReview.push(oNewReview);

            // 모델에 변경된 데이터 반영
            oModel.setProperty("/Review", aReview);

            // Dialog 닫기
            oEvent.getSource().getParent().close();
        },

        onSelect: function(oEvent){
            console.log("========onSelect=======")

            let oContext = oEvent.getParameter("listItem").getBindingContext();
            this.DeletePath = oContext.getPath();
            console.log(oContext);
            console.log(this.DeletePath);
        },

        onDelete: function() {
            let oTable = this.byId("idProductsTable");
            let oSelectedItem = oTable.getSelectedItem();

            // 선택한 행이 있는지 확인
            if (!oSelectedItem) {
                return;
            }

            // 선택한 행의 데이터 경로 가져오기
            let oContext = oSelectedItem.getBindingContext();
            let oModel = this.getView().getModel();
            let aMenu = oModel.getProperty("/Restaurant");

            // 배열에서 해당 데이터의 인덱스 추출
            let iIndex = Number(this.DeletePath.split("/").pop());

            // 모델 데이터에서 삭제
            aMenu.splice(iIndex, 1);
            oModel.setProperty("/Menu", aMenu);

         // LocalStorage에 변경된 데이터 저장
            // localStorage.setItem("menuData", JSON.stringify(oModel.getData()));
        },

        onSortChange:function(oEvent) {
            let sKey = oEvent.getParameter("selectedItem").getKey();
            let oTable = this.byId("idProductsTable");
            let oBinding = oTable.getBinding("items");

            let oSorter;

            if(sKey === "desc"){
                oSorter = new Sorter("scope", true);
            } else {
                oSorter = new Sorter("scope", false);
            };

            oBinding.sort(oSorter);
        },
        onSortDistance:function(oEvent1) {
            let sKey1 = oEvent1.getParameter("selectedItem").getKey();
            let oTable1 = this.byId("idProductsTable");
            let oBinding1 = oTable1.getBinding("items");

            let oDistance;
            
            if(sKey1 === "Dasc"){
                oDistance = new Sorter("distance", true);
            } else {
                oDistance = new Sorter("distance", false);
            };
            
            oBinding1.sort(oDistance);
        },

        listFind: function(){
            let listId = this.byId("listId").getValue();
            let oTableList = this.byId("idProductsTable");

             if(listId === ""){
                oTableList.getBinding("items").filter([]);
                return;
            }

            //리스트 필터 적용
            let oFilter = new Filter("name", FilterOperator.EQ,listId);

            //테이블에 리스트 적용
            oTableList.getBinding("items").filter(oFilter);  

        },
        onFavorite:function(oEvent) {
            let oIcon = oEvent.getSource();
            let oSrc = oIcon.getSrc();

            if(oSrc === "sap-icon://add-favorite") {
                oIcon.setSrc("sap-icon://favorite");
            } else  {
                oIcon.setSrc("sap-icon://add-favorite");
            };
        },
        onReset:function() {
            let oTable = this.byId("idProductsTable");
            let oBinding = oTable.getBinding("items");

            oBinding.sort(null);
        }
        
    });
});