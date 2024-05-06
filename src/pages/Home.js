import React, { useEffect, useState } from 'react'
import { IoDiamond, IoStatsChart } from 'react-icons/io5';
import { RxCross2 } from "react-icons/rx";
import { FaCrown, FaUser } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

// Marketplace Backend -- = ethers
import Nft from "../utils/Nft";
import { ethers } from 'ethers';
import whitelist from '../components/whitelist';
import MarketplaceApi from "../utils/MarketplaceApi";



function Home() {

  //Marketplace sold and listed

  const [recentListings, setRecentListings] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  const [floorPrices, setFloorPrices] = useState({});

  const [marketStats, setMarketStats] = useState({ totalVolumeTraded: '0', totalVolumeTradedWETH: '0' });



  //fetching recent listings
  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const listingsData = await MarketplaceApi.fetchActiveListings();
        // Assume listingsData is an array of listing objects
        const listingsWithMetadata = await Promise.all(listingsData.map(async (listing) => {
          const nft = new Nft(199, listing.erc721Address, listing.tokenId);
          const metadata = await nft.metadata();
          return {
            ...listing,
            name: metadata.name,
            image: nft.image(),
            displayPrice: ethers.utils.formatEther(String(listing.price)),
            price: listing.price,
            expired: (Date.now() / 1000) > listing.expireTimestamp
          };
        }));
        setRecentListings(listingsWithMetadata);
      } catch (error) {
        console.error('Failed to fetch recent listings:', error);
      }
    };
    fetchRecentListings();
  }, []);

  //fetching recent sales
  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const salesData = await MarketplaceApi.fetchSoldNFTs();
        const salesWithMetadata = await Promise.all(salesData.map(async (sale) => {
          const nft = new Nft(199, sale.erc721Address, sale.tokenId);
          const metadata = await nft.metadata();
          return {
            ...sale,
            name: metadata.name,
            image: nft.image(),
            price: ethers.utils.formatEther(String(sale.price))
          };
        }));
        setRecentSales(salesWithMetadata);
      } catch (error) {
        console.error('Failed to fetch recent sales:', error);
      }
    };
    fetchRecentSales();
  }, []);


  //total volume traded
  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const stats = await MarketplaceApi.fetchMarketStats();
        setMarketStats(stats);
      } catch (error) {
        console.error('Failed to fetch market stats:', error);
      }
    };
    fetchMarketStats();
  }, []);


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


  // Function to fetch floor price for a single collection
  useEffect(() => {
    const fetchAndSetFloorPrices = async (collections) => {
      const floorPricesUpdates = {};
      for (const collection of collections) {
        try {
          const stats = await MarketplaceApi.fetchCollectionStats(collection.address);
          floorPricesUpdates[collection.address] = stats.floorPrice; // Assuming stats object contains a floorPrice
        } catch (error) {
          console.error(`Failed to fetch floor price for collection ${collection.address}:`, error);
          floorPricesUpdates[collection.address] = '0'; // Use 'N/A' or similar on failure
        }
      }
      setFloorPrices(prevPrices => ({ ...prevPrices, ...floorPricesUpdates }));
    };

    // Combine your collections into one array before passing to the fetching function
    const allCollections = [...firstHalfCollections, ...secondHalfCollections];
    fetchAndSetFloorPrices(allCollections);
  }, []);

  //fomart M,K,T
  const formatPrice = (value) => {
    const num = Number(value);

    if (num >= 1e9) { // For billions
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) { // For millions
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) { // For thousands
      return (num / 1e3).toFixed(2) + 'K';
    } else { // For numbers less than 1000
      return num.toString();
    }
  };

  return (
    <div className='flex justify-center items-center flex-col w-full py-20 px-20 sm:px-4 sm:pb-10'>
      <div className='w-[1257px] sm:w-[95%]'>

        <h1 className='text-black-400 font-Kallisto font-semibold text-[40px] text-center dark:text-black-50 tracking-wider sm:text-sm'>A Fully Decentralized Bittorent Chain Marketplace</h1>
        <h1 className='text-black-50 font-Kallisto font-medium text-xl text-center dark:text-white sm:text-[12px]'>Buy, Sell, Mint and Trade Non-Fungible Digital Assets</h1>
        <div className='bg-grey-50 px-10 py-8 flex sm:py-4 sm:px-5 sm:gap-5 justify-between items-center w-full mt-8 sm:mt-0 rounded-lg sm:overflow-x-scroll'>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px] flex justify-center items-center'>
              <RxCross2 className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              {formatPrice(parseFloat(ethers.utils.formatEther(String(marketStats.totalVolumeTraded || '0'))).toFixed(5))}
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Total Volume</span>
            </p>
          </div>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[4px] flex justify-center items-center'>
              <IoStatsChart className='text-white text-base' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              {formatPrice(parseFloat(ethers.utils.formatEther(String(marketStats.totalVolumeTradedWETH || '0'))).toFixed(5))}
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>WBTT Total Volume</span>
            </p>
          </div>
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px]  flex justify-center items-center'>
              <IoDiamond className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              ...
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Total Royalties</span>
            </p>
          </div>
          {/* <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px] flex justify-center items-center'>
              <FaUser className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              950
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Unique Wallet</span>
            </p>
          </div> */}
          <div className='flex justify-start items-center gap-3'>
            <span className='bg-grey-100 rounded-full p-[3px] sm:p-[2px] flex justify-center items-center'>
              <FaCrown className='text-white text-lg' />
            </span>
            <p className='font-semibold font-Kallisto text-black-400 dark:text-white text-base sm:text-sm flex gap-2 sm:gap-1'>
              ...
              <span className='text-[12px] text-black-50 capitalize font-medium dark:text-[#babac9] whitespace-nowrap'>Total Minited NFTs</span>
            </p>
          </div>
        </div>

        <div className='flex flex-col justify-start items-start mt-12 w-full'>
          <div className='flex justify-between items-center w-full relative'>
            <div className='flex justify-start gap-2 items-center sm:flex-col sm:flex-wrap sm:items-start sm:w-full'>
              <h1 className='text-black-400 font-Kallisto font-semibold text-2xl text-left dark:text-white tracking-wider sm:text-base'>BTTC NFT Collections</h1>
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
                    <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>FLOOR</p>
                  </div>
                </div>

                {firstHalfCollections?.map((collection, index) => {
                  // Use collection.address to get the floor price from the floorPrices state
                  const checksumAddress = ethers.utils.getAddress(collection.address);
                  const floorPrice = floorPrices[checksumAddress];
                  return <Link to={`/collection/${collection.address}`} key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                    <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%]  sm:w-[60%]'>
                      <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{collection.index}</p>
                      <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={collection.image} alt={collection.name} />
                      <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{collection.name}</p>
                    </div>
                    <div className='flex justify-start gap-10 items-center w-[30%] sm:w-[35%] sm:gap-8'>
                      <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-grey-100 text-left flex items-center'>
                        <img src={require('../assets/logo/bttc.png')} className='w-5 mr-1' alt="BTTC Logo" />
                        {formatPrice(parseFloat(ethers.utils.formatEther(String(floorPrice || '0'))).toFixed(5))}
                      </p>
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
                  // Use collection.address to get the floor price from the floorPrices state
                  const checksumAddress = ethers.utils.getAddress(collection.address);
                  const floorPrice = floorPrices[checksumAddress];
                  return <Link to={`/collection/${collection.address}`} key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                    <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%]  sm:w-[60%]'>
                      <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{collection.index}</p>
                      <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={collection.image} alt={collection.name} />
                      <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{collection.name}</p>
                    </div>
                    <div className='flex justify-start gap-10 items-center w-[30%] sm:w-[35%] sm:gap-8'>
                      <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-grey-100 text-left flex items-center'>
                        <img src={require('../assets/logo/bttc.png')} className='w-5 mr-1' alt="BTTC Logo" />
                        {parseFloat(ethers.utils.formatEther(String(floorPrice || '0'))).toFixed(5)}
                      </p>
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
                {recentListings.slice(0, 5).map((recentListing, index) => {
                  if (recentListing.expired) return
                  return (
                    <div key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
                      <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%] sm:w-[60%]'>
                        <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{index + 1}</p>
                        <Link to={`/collection/${recentListing.erc721Address}/${recentListing.tokenId}`} className="flex items-center gap-3 sm:gap-2">
                          <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={recentListing.image} alt={recentListing.name} />
                        </Link>
                        <div className='flex flex-col gap-2'>
                          <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{recentListing.name}</p>
                          <div className='text-[12px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px] flex gap-1 items-center'>
                            <img src={require('../assets/logo/bttc.png')} className='w-5' alt="BTTC Logo" />
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
                      <Link to={`/collection/${recentSales.erc721Address}/${recentSales.tokenId}`} className="flex items-center gap-3 sm:gap-2">
                        <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={recentSales.image} alt={recentSales.name} />
                      </Link>
                      <div className='flex flex-col gap-2'>
                        <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{recentSales.name}</p>
                        <p className='text-[12px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px] flex gap-1 items-center'>
                          <img src={require('../assets/logo/bttc.png')} className='w-5' />
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