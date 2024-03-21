import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { IoDiamond, IoStatsChart } from 'react-icons/io5';
import { RxCross2 } from "react-icons/rx";
import { TbAntennaBars5 } from "react-icons/tb";
import { FaCrown, FaUser } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import HomeCollection from '../components/HomeCollection';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slides from '../components/Slides';
import { FaMeta } from 'react-icons/fa6';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

//subgraph -- = ethers
import Nft from "../utils/Nft";
import { useQuery } from '@apollo/client';
import { GET_MOST_RECENT_LISTING, GET_MOST_RECENT_SOLD } from '../graphql/Queries';
import { ethers } from 'ethers';
import whitelist from '../components/whitelist';


function Home() {

  //subgraph sold and listed
  const { data: recentListingsData } = useQuery(GET_MOST_RECENT_LISTING);
  const { data: recentSalesData } = useQuery(GET_MOST_RECENT_SOLD);

  const [recentListings, setRecentListings] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    if (recentListingsData && recentListingsData.listings) {
      const fetchListingsMetadata = async () => {
        const listingsWithMetadata = await Promise.all(recentListingsData.listings.map(async (listing) => {
          const nft = new Nft(168587773, listing.erc721Address, listing.tokenId);
          const metadata = await nft.metadata();
          return {
            ...listing,
            name: metadata.name,
            image: nft.image(),
            //price: ethers.utils.formatEther(listing.price)
            displayPrice: ethers.utils.formatEther(listing.price), // Price for display
            price: listing.price, // Original price in wei for transactions
            expired: (Date.now() / 1000) > listing.expireTimestamp
          };
        }));
        setRecentListings(listingsWithMetadata);
      };
      fetchListingsMetadata();
    }
  }, [recentListingsData]);

  useEffect(() => {
    if (recentSalesData && recentSalesData.sales) {
      const fetchSalesMetadata = async () => {
        const salesWithMetadata = await Promise.all(recentSalesData.sales.map(async (sale) => {
          const nft = new Nft(168587773, sale.erc721Address, sale.tokenId);
          const metadata = await nft.metadata();
          return {
            ...sale,
            name: metadata.name,
            image: nft.image(),
            price: ethers.utils.formatEther(sale.price)
          };
        }));
        setRecentSales(salesWithMetadata);
      };
      fetchSalesMetadata().then(() => {});
    }
  }, [recentSalesData]);

  // Convert whitelist object to array and map to include name and index
  const collectionsArray = Object.entries(whitelist).map(([name, details], index) => ({
    ...details,
    name,
    index: index + 1,
  }));

  // Calculate the midpoint
  const midpoint = Math.ceil(collectionsArray.length / 2);

  // Split the array into two halves
  const firstHalfCollections = collectionsArray.slice(0, midpoint);
  const secondHalfCollections = collectionsArray.slice(midpoint);

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
    <div className='flex justify-center items-center flex-col w-full py-20 px-20 sm:px-4 sm:pb-10'>
      <div className='w-[1257px] sm:w-[95%]'>

        <h1 className='text-black-400 font-Kallisto font-semibold text-[40px] text-center dark:text-black-50 tracking-wider sm:text-sm'>The Leading NFT Marketplace</h1>
        <h1 className='text-black-50 font-Kallisto font-medium text-xl text-center dark:text-white sm:text-[12px]'>Buy, Sell, Mint and Trade Non-Fungible Digital Assets</h1>

        {/* <Slides /> */}
        {/* 
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
        </div> */}


        <div className='bg-grey-50 px-10 py-8 flex sm:py-4 sm:px-5 sm:gap-5 justify-between items-center w-full mt-8 sm:mt-0 rounded-lg sm:overflow-x-scroll'>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px] flex justify-center items-center'>
              <RxCross2 className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              38.6M
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Total Volume</span>
            </p>
          </div>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[4px] flex justify-center items-center'>
              <IoStatsChart className='text-white text-base' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              9568
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Daily Total Volume</span>
            </p>
          </div>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px]  flex justify-center items-center'>
              <IoDiamond className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              860K
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Total Royalties</span>
            </p>
          </div>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px] flex justify-center items-center'>
              <FaUser className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              950
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Unique Wallet</span>
            </p>
          </div>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px] flex justify-center items-center'>
              <FaCrown className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              38.6M
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Total Minited NFTs</span>
            </p>
          </div>
        </div>

        <div className='flex flex-col justify-start items-start mt-12 w-full'>
          <div className='flex justify-between items-center w-full relative'>
            <div className='flex justify-start gap-2 items-center sm:flex-col sm:flex-wrap sm:items-start sm:w-full'>
              <h1 className='text-black-400 font-Kallisto font-semibold text-2xl text-left dark:text-white tracking-wider sm:text-base'>XRPL NFT Collections</h1>
              <div className='ml-4 sm:ml-0 flex justify-start sm:w-full gap-4'>
                <span className='w-[150px] sm:w-[50%]'>
                  <Dropdown options={[{ id: 'Trending', value: 'Trending' }, { id: 'Top', value: 'Top' }]} selectedOption={() => { }} />
                </span>
              </div>
            </div>
            <Link to='/explore/collections' className='text-blue-200 sm:text-[10px] sm:absolute right-5 top-0 dark:text-black-50 underline font-Kallisto font-medium hover:no-underline text-[12px]'>{"View All >"} </Link>
          </div>

          <div className='flex justify-between items-start w-full gap-10 mt-10 sm:mt-4'>
            <div className='w-[50%] sm:w-full'>
              {/* <HomeCollection i will fix the floor price and volume later */}
              <div className='flex flex-col w-full'>
                <div className='flex justify-between items-center gap-20 mb-2'>
                  <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left w-[65%] sm:w-[55%]'>COLLECTION</p>
                  <div className='flex justify-start gap-10 items-center w-[35%] sm:w-[45%] sm:gap-7'>
                    {/* <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>FLOOR</p> */}
                    <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>VOLUME</p>
                  </div>
                </div>

                {firstHalfCollections?.map((collection, index) => {
                  return <Link to={`/collection/${collection.address}`} key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                    <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%]  sm:w-[60%]'>
                      <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{collection.index}</p>
                      <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={collection.image} alt={collection.name} />
                      <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{collection.name}</p>
                    </div>
                    <div className='flex justify-start gap-10 items-center w-[30%] sm:w-[35%] sm:gap-8'>
                      {/* <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>$ {collection.floor || 'N/A'}</p> */}
                      <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-grey-100 text-left'>$ {collection.volume || 'N/A'}</p>
                    </div>
                  </Link>
                })}

              </div>
            </div>
            <div className='w-[50%] sm:hidden'>
              {/* <HomeCollection i will fix the floor price and volume later} /> */}
              <div className='flex flex-col w-full'>
                <div className='flex justify-between items-center gap-20 mb-2'>
                  <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left w-[65%] sm:w-[55%]'>COLLECTION</p>

                </div>

                {secondHalfCollections?.map((collection, index) => {
                  return <Link to={`/collection/${collection.address}`} key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                    <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%]  sm:w-[60%]'>
                      <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{collection.index}</p>
                      <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={collection.image} alt={collection.name} />
                      <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{collection.name}</p>
                    </div>
                    <div className='flex justify-start gap-10 items-center w-[30%] sm:w-[35%] sm:gap-8'>
                      {/* <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>$ 320</p> */}
                      <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-grey-100 text-left'>$ 3410</p>
                    </div>
                  </Link>
                })}

              </div>
            </div>
          </div>


          {/* herw */}
          <div className='flex justify-between items-start sm:flex-col w-full gap-10 mt-10 sm:mt-4'>
            <div className='w-[50%] sm:w-full'>
              <div className='flex flex-col w-full'>
                <div className='flex justify-between items-center gap-20 mb-2'>
                  <p className='text-black-400 font-Kallisto font-semibold text-2xl text-left dark:text-white tracking-wider sm:text-base'>Recent Listings</p>
                </div>

                {/* {recentListings.slice(0, 5).map((recentListings, index) => {
                  return <div key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                    <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%]  sm:w-[60%]'>
                      <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{index + 1}</p>
                      <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={recentListings.image} alt={recentListings.name} />
                      <div className='flex flex-col gap-2'>
                        <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{recentListings.name}</p>
                        <p className='text-[12px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px] flex gap-1 items-center'>{recentListings.displayPrice}
                          <img src={require('../assets/logo/eth.png')} className='w-5' />
                        </p>
                      </div>
                    </div>

                  </div>
                })} */}
                {recentListings.slice(0, 5).map((recentListing, index) => {
                  if(recentListing.expired) return
                  return (
                    <div key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                      <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%] sm:w-[60%]'>
                        <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{index + 1}</p>
                        <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={recentListing.image} alt={recentListing.name} />
                        <div className='flex flex-col gap-2'>
                          <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{recentListing.name}</p>
                          <div className='text-[12px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px] flex gap-1 items-center'>
                            <img src={require('../assets/logo/eth.png')} className='w-5' alt="ETH Logo" />
                            {recentListing.displayPrice}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}


              </div>
            </div>

            <div className='w-[50%] sm:w-full'>
              <div className='flex flex-col w-full'>
                <div className='flex justify-between items-center gap-20 mb-2'>
                  <p className='text-black-400 font-Kallisto font-semibold text-2xl text-left dark:text-white tracking-wider sm:text-base'>Recent Sales</p>
                </div>

                {recentSales.slice(0, 5).map((recentSales, index) => {
                  return <div key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                    <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%]  sm:w-[60%]'>
                      <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{index + 1}</p>
                      <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={recentSales.image} alt={recentSales.name} />
                      <div className='flex flex-col gap-2'>
                        <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{recentSales.name}</p>
                        <p className='text-[12px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px] flex gap-1 items-center'>
                          <img src={require('../assets/logo/eth.png')} className='w-5' />
                          {recentSales.price}
                        </p>
                      </div>
                    </div>

                  </div>
                })}

              </div>
            </div>

          </div>

          {/* ADDED  A SEPARATOR HERE TO MAKE/ SHOW ALL LATEST SOLD AND LATES Listing */}
          {/* <div className='flex justify-between items-start w-full gap-10 mt-10 sm:mt-4'> */}

        </div>
      </div>


    </div>
    // </div>
  )
}

export default Home




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