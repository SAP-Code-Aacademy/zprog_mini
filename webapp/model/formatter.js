sap.ui.define([], () => {
  "use strict";

  return {
    // 별점 평균 구하기
    averageRating(reviews) {
      if (!reviews?.length) return "0.0";

      const sum = reviews.reduce(
        (sum, review) => sum + Number(review.scope),
        0,
      );

      return (sum / reviews.length).toFixed(1); // 소숫점한자리
    },

    // 네이버 static Map API로 지도 이미지 가져오는 url 을 반환하는 함수
    // 참고 문헌 : https://api.ncloud-docs.com/docs/application-maps-static
    mapURI(longitude, latitude) {
      if (longitude == null || latitude == null) return "";

      // viewSizeRatio : 마커 크기 비율
      // size : 마커 사이즈
      // type : d < 기본 타입
      // pos : 마커 표시될 위도 경도
      const marker = encodeURIComponent(
        `type:d|size:mid|pos:${longitude} ${latitude}|viewSizeRatio:0.7`,
      );

      return (
        "https://maps.apigw.ntruss.com/map-static/v2/raster-cors" +
        "?w=404&h=120" + // 너비 404, 높이 110
        `&center=${longitude},${latitude}` + // 중심 좌표 (음식점)
        "&level=16" + // 줌 레벨
        `&markers=${marker}` + // 마커 위치
        "&X-NCP-APIGW-API-KEY-ID=itjfky82d3"
      ); // Client Key
    },

    // 현재 시간에 영업 중인지 true false 반환하는 함수
    isStoreOpen(open, close) {
      if (!open || !close) return false;

      const toMinutes = (time) => {
        const [hour, minute] = time.split(":").map(Number);
        return hour * 60 + minute;
      };

      const now = new Date();
      const current = now.getHours() * 60 + now.getMinutes();

      const start = toMinutes(open);
      const end = toMinutes(close);

      const isOpen =
        start < end
          ? current >= start && current < end
          : start > end
            ? current >= start || current < end
            : false;

      return isOpen;
    },

    // 영업중이 아닐때
    isStoreClosed(open, close) {
    return !this.formatter.isStoreOpen(open, close);
    }
  };
});
