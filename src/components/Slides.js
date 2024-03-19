import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { FaMeta } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

function Slides() {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToScroll: 1,
        className: "space-y-4",
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />
    };

    if (window.innerWidth <= 768)
        settings.slidesToShow = 1
    else
        settings.slidesToShow = 3

    return (
        <div className="slider-container w-[1280px] mt-4 sm:mt-0 sm:w-full sm:px-0">
            <Slider {...settings}>
                {[1, 1, 11, 1, 1, 1,].map((s, index) => {
                    return <Link key={index} to={`/collection/${0}`} className="h-[400px] sm:h-[350px] overflow-hidden rounded-lg px-4 sm:px-2 relative">
                        <div className="overflow-hidden rounded-lg">
                            <img className="w-full h-full object-cover hover:scale-110 transition-all ease-in duration-150" src={"https://marketplace-image.onxrp.com/?uri=https%3A%2F%2Fnftimg.onxrp.com%2F1706711759180pfp.jpeg&width=840&height=840"} />
                        </div>
                        <div className="bg-white py-2 px-3 rounded-md absolute top-4 right-8 dark:bg-black-500 sm:right-4 sm:top-3">
                            <h2 className="font-Kallisto font-medium text-[12px] sm:text-[10px] sm:gap-2 tracking-widest text-black-400 dark:text-white flex items-center gap-3">
                                RANK {index}
                                <FaMeta />
                                <span className="font-normal dark:text-white/60 text-black-50">715 Burnt</span>
                            </h2>
                        </div>
                        <div className="flex flex-col absolute left-8 bottom-5 sm:left-5 sm:bottom-24 ">
                            <h1 className="font-Kallisto capitalize text-2xl font-semibold text-white tracking-wider sm:text-lg">UINXPUNK</h1>
                            <p className="font-Kallisto font-medium text-white/75 text-sm uppercase tracking-wider sm:text-[12px]">FLoor $ 84</p>
                        </div>
                    </Link>
                })}
            </Slider>
        </div>
    );
}

export default Slides;




const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
        <div className="bg-grey-100/20 flex justify-center items-center rounded-full w-[60px] h-[60px] cursor-pointer absolute -left-3 top-[150px] z-[50] sm:top-[130px] sm:w-[40px] sm:h-[40px] sm:bg-grey-100/40" onClick={onClick}>
            <IoIosArrowBack className="text-black-400 dark:text-white text-2xl sm:text-xl" />
        </div>
    );
};

const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
        <div className="bg-grey-100/20 flex justify-center items-center rounded-full w-[60px] h-[60px] cursor-pointer absolute -right-3 top-[150px] sm:top-[120px] sm:w-[40px] sm:h-[40px] sm:bg-grey-100/40" onClick={onClick}>
            <IoIosArrowForward className="text-black-400 dark:text-white text-2xl sm:text-xl" />
        </div>
    );
};
