sap.ui.define([], () => {
    "use strict";

    return {
        averageRating(reviews) {
            if (!reviews?.length) return "0.0";

            const sum = reviews.reduce(
                (sum, review) => sum + Number(review.scope),
                0
            );

            return (sum / reviews.length).toFixed(1); // 소숫점한자리
        }
    };
});