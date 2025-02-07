import Header from "@/components/header/page";
import FoodReviewApp from "@/pages/food-review-app/page";

export default function FoodReview() {
  return (
    <div>
      <Header button={true} />
      <FoodReviewApp />
    </div>
  );
}
