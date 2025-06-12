import React from "react";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";

import { carousel_images } from "../../assets/images/links-images";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleNavigation = (item, index) => {
    if (index === 1) {
      navigate("/deposit"); // Direct route
    } else if (index === 2) {
      navigate("/promotion/recharge-awards"); // Direct route
    } else if (index === 3) {
      navigate("/promotion"); // Direct route
    } else if (index === 4) {
      navigate("/svip"); // Direct route
    } else {
      const url = `/promotions-details/${encodeURIComponent(
        item.title
      )}/${encodeURIComponent(item.image)}/${encodeURIComponent(
        item.details || "No Details"
      )}`;
      navigate(url);
    }
  };
  return (
    <div className="w-full relative px-2">
      {" "}
      {/* Slightly rounded corners */}
      <Carousel
        autoPlay={true}
        interval={1000} // Change slide every second
        infiniteLoop={true} // Infinite loop for carousel
        showArrows={true} // Show navigation arrows
        showStatus={false} // Hide the slide status
        showThumbs={false} // Hide thumbnails
        stopOnHover={true} // Pause carousel on hover
        dynamicHeight={false} // Fix height, do not adjust per slide
        className="rounded-lg cursor-pointer" // Optional: Adding some round edges to carousel itself
      >
        {carousel_images.map((image, index) => (
          <div key={index} onClick={() => handleNavigation(image, index)}>
            <img
              src={image.image}
              alt={`carousel-img-${index}`}
              className="w-full h-full object-cover rounded-md "
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
