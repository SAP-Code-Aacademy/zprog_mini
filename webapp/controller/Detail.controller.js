sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "zprogmini/model/formatter",
    "sap/m/MessageToast",
  ],
  (Controller, JSONModel, formatter, MessageToast) => {
    "use strict";

    return Controller.extend("zprogmini.controller.Detail", {
      formatter: formatter,

      // HeaderContent 영역에 있는 이미지 슬라이더의 0번째에 가게 사진 추가
      _insertPageToCarousel(path) {
        const sImgPath = path + "/imgUrl";

        this.imgSrc = this.getOwnerComponent().getModel().getProperty(sImgPath);

        console.log(sImgPath);
        const oCarousel = this.byId("idCarousel");

        // 이미지 페이지가 생성된 경우,
        if (this.imgSrc) {
          oCarousel.removePage(0);
        }
        const oResImage = new sap.m.Image({
          src: this.imgSrc,
          width: "466px",
          height: "282px",
          mode: "Background",
          backgroundSize: "cover",
          backgroundPosition: "center",
        });
        oResImage.addStyleClass("restaurantMainImage");
        oCarousel.insertPage(oResImage, 0);
        oCarousel.setActivePage(oCarousel.getPages()[0].getId());
      },

      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();

        oRouter
          .getRoute("RouteDetail")
          .attachPatternMatched(this._onPatternMatched, this);
      },

      _onPatternMatched: function (oEvent) {
        console.log("==========_onPatternMatched==========");
        const oModel = this.getOwnerComponent().getModel();

        const sRestaurantId = oEvent.getParameter("arguments").paramOrder;
        const aRestaurants = oModel.getProperty("/Restaurant");

        const iRestaurantId = Number(sRestaurantId);
        // 현재 상세 화면의 식당 ID 저장
        this._iRestaurantId = iRestaurantId;
        
        const iIndex = aRestaurants.findIndex(
          (oItem) => oItem.id === iRestaurantId,
        );

        const sPath = `/Restaurant/${iIndex}`;
        //@TODO: id 수정, ObjectPageLayout -> idObjectPageLayout으로 수정
        this.byId("ObjectPageLayout").bindElement(sPath);

        //전역으로 된 review 모델 가져옴
        let reModel = this.getOwnerComponent()
          .getModel("review")
          .getProperty("/Review");

        let reviewFind = reModel.filter(function (sItem) {
          return sItem.id === iIndex;
        });
        let newReview = new JSONModel(reviewFind);
        this.getView().setModel(newReview, "detailReview");

        const ab = this.getView().getModel("detailReview").getData();
        console.log(ab);

        // Location에서 해당 Restaurants 찾기
        const oLocationModel = this.getOwnerComponent().getModel("location");
        const aLocations = oLocationModel.getProperty("/Location");

        const iLocationIndex = aLocations.findIndex(
          (oItem) => oItem.restaurantID === iRestaurantId,
        );

        console.log(aLocations[iLocationIndex]);

        this.byId("idVBoxlocationInfo").bindElement({
          path: `/Location/${iLocationIndex}`,
          model: "location",
        });

        this._insertPageToCarousel(sPath);
      },

      backNav: function () {
        const oRouter = this.getOwnerComponent().getRouter();

        // Router 중에서, RouterDetail로 이동
        oRouter.navTo("RouteMain");
      },

      // 찜하기
      onPressFavorite(oEvent) {
        const context = oEvent.getSource().getBindingContext();
        const model = context.getModel();
        const path = context.getPath() + "/isFavorite";
        const isFavorite = !!model.getProperty(path);

        if (isFavorite) {
          MessageToast.show("이미 찜 목록에 있습니다.");
          return;
        }

        model.setProperty(path, true);
        MessageToast.show("찜 목록에 추가되었습니다.");
      },

      // 공유하기
      async onPressShare() {
        const url = window.location.href;

        try {
          if (navigator.share) {
            await navigator.share({
              title: "맛집 공유",
              url: url,
            });
          } else {
            await navigator.clipboard.writeText(url);
            MessageToast.show("링크가 복사되었습니다.");
          }
        } catch (error) {
          // 공유창을 닫은 경우는 안내하지 않음
          if (error.name === "AbortError") return;

          MessageToast.show("공유하지 못했습니다.");
          console.error(error);
        }
      },
      onDeleteReview: function (oEvent) {

        console.log("삭제 함수 실행됨!");

        // 1. 삭제 버튼이 속한 CustomListItem 가져오기
        let oSelectedItem = oEvent.getSource().getParent();

        // 2. 해당 리뷰의 실제 데이터 가져오기
        let oSelectedReview = oSelectedItem
            .getBindingContext("detailReview")
            .getObject();

        console.log("삭제할 리뷰:", oSelectedReview);

        // 3. 전체 리뷰 데이터가 들어 있는 review 모델 가져오기
        let oReviewModel = this.getOwnerComponent().getModel("review");
        let aReview = oReviewModel.getProperty("/Review");

        // 4. reviewId가 일치하는 리뷰 찾기
        let iIndex = aReview.findIndex(function (item) {
            return item.reviewId === oSelectedReview.reviewId;
        });

        // 5. 해당 리뷰 삭제
        if (iIndex !== -1) {
            aReview.splice(iIndex, 1);
            oReviewModel.setProperty("/Review", aReview);

            // 6. 현재 화면의 리뷰 목록 갱신
            let aDetailReview = aReview.filter(function (item) {
                return item.id === this._iRestaurantId;
            }.bind(this));

            this.getView()
                .getModel("detailReview")
                .setData(aDetailReview);

            MessageToast.show("리뷰가 삭제되었습니다.");
        }
    }
    });
  },
);
