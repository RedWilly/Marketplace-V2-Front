import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { CiCircleInfo, CiTwitter } from 'react-icons/ci'
import { GoCheckCircleFill } from 'react-icons/go'
import { IoIosArrowDown } from 'react-icons/io'
import { PiDiscordLogoLight, PiTelegramLogoFill, PiYoutubeLogoLight } from 'react-icons/pi'
import { Link } from 'react-router-dom'
import Dropdown from '../components/Dropdown'
import Card2 from '../components/Card2'
import { RxCross2 } from 'react-icons/rx'

import { ethers } from 'ethers';
import Nft from "../utils/Nft"; //middleware api for getting nft img, metadata and owner
import MarketplaceApi from "../utils/MarketplaceApi"; //middleware api for getting nft details and collection stats
import whitelist from '../components/whitelist';

import BuyNow from '../components/Market/BuyNow';



function Collection() {
  const [showLess, setShowLess] = useState(true)
  const [sidebar, setSideBar] = useState(window.innerWidth < 768 ? false : true)

  let { contractAddress } = useParams();
  contractAddress = contractAddress.toLowerCase();
  const [collectionName, setCollectionName] = useState('');
  const [listings, setListings] = useState([]);
  const [listingsData, setListingsData] = useState({ listings: [] });

  const [collectionDetails, setCollectionDetails] = useState({});
  const [nftCount, setNftCount] = useState(0); //updates Listings count to display :)

  const metadataCache = {};
  const imageCache = {};


  const [collectionStats, setCollectionStats] = useState({
    floorPrice: 0,
    totalVolumeTraded: 0,
    totalVolumeTradedWETH: 0,
  });

  // collection stats & listing info & collection Name
  useEffect(() => {
    async function loadCollectionStats() {
      try {
        const checksumAddress = ethers.utils.getAddress(contractAddress);
        const stats = await MarketplaceApi.fetchCollectionStats(checksumAddress);
        setCollectionStats(stats);
      } catch (error) {
        console.error("Failed to fetch collection stats:", error);
      }
    }

    async function loadActiveListings() {
      try {
        const checksumAddress = ethers.utils.getAddress(contractAddress);
        const activeListings = await MarketplaceApi.fetchActiveListingsForCollection(checksumAddress);
        console.log("Active Listings Data:", activeListings);
        setListingsData({ listings: activeListings });
      } catch (error) {
        console.error("Error fetching active listings:", error);
      }
    }

    async function loadCollectionName() {
      try {
        const nftInstance = new Nft(168587773, contractAddress);
        const name = await nftInstance.collectionName();
        console.log("Collection Name:", name);
        setCollectionName(name);
      } catch (error) {
        console.error("Failed to fetch collection name:", error);
      }
    }


    loadCollectionName();
    loadActiveListings();
    loadCollectionStats();
  }, [contractAddress]); // Re-fetch stats if contractAddress changes :}


  // Fetching collection details based on contractAddress
  useEffect(() => {
    const details = Object.values(whitelist).find(collection => collection.address.toLowerCase() === contractAddress);
    if (details) {
      setCollectionDetails(details);
    }
  }, [contractAddress]);


  // const fetchListingsMetadata = async () => {
  //   const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
  //   if (listingsData && listingsData.listings) {
  //     console.log("Processing listings data...");
  //     const updatedListings = await Promise.all(
  //       listingsData.listings
  //         // each listing has an 'expireTimestamp' that you can compare
  //         .filter(listing => parseInt(listing.expireTimestamp) > currentTimestamp) // Keep only listings that haven't expired
  //         .map(async (listing) => {
  //           try {
  //             const nft = new Nft(168587773, contractAddress, listing.tokenId); // Use the actual chain ID
  //             const metadata = await nft.metadata();
  //             console.log("Fetched Metadata: ", metadata);
  //             return {
  //               ...listing,
  //               image: nft.image(),
  //               name: metadata.name,
  //             };
  //           } catch (error) {
  //             console.error("Error fetching token URI for listing:", listing, error);
  //             return null; // Return null for listings that encounter an error
  //           }
  //         })
  //     );
  //     console.log("Updated Listings with Metadata:", updatedListings);
  //     const validListings = updatedListings.filter(listing => listing !== null); // Filter out any null values from errors
  //     setListings(validListings);
  //     setNftCount(validListings.length); // Update the listings count
  //   }
  // };

  const fetchListingsMetadata = async () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (listingsData && listingsData.listings) {
      console.log("Processing listings data...");
      const updatedListings = await Promise.all(
        listingsData.listings
          .filter(listing => parseInt(listing.expireTimestamp) > currentTimestamp)
          .map(async (listing) => {
            const uniqueId = `${contractAddress}-${listing.tokenId}`;

            // Start fetch or await existing fetch
            if (!metadataCache[uniqueId]) {
              // Store the fetch promise itself in the cache
              const fetchPromise = (async () => {
                try {
                  const nft = new Nft(168587773, contractAddress, listing.tokenId);
                  const metadata = await nft.metadata();
                  const image = nft.image();
                  console.log("Metadata retrieved:", uniqueId);

                  // Once the data is fetched, replace the promise with actual data
                  metadataCache[uniqueId] = metadata;
                  imageCache[uniqueId] = image;

                  return {
                    ...listing,
                    image: image,
                    name: metadata.name,
                  };
                } catch (error) {
                  console.error("Error fetching token URI for listing:", listing, error);
                  return null;
                }
              })();
              metadataCache[uniqueId] = fetchPromise;
              return fetchPromise;
            } else if (metadataCache[uniqueId] instanceof Promise) {
              // If a fetch is ongoing, await the existing promise
              return metadataCache[uniqueId];
            } else {
              // Data is already in cache
              return {
                ...listing,
                image: imageCache[uniqueId],
                name: metadataCache[uniqueId].name,
              };
            }
          })
      );

      console.log("Updated Listings with Metadata:", updatedListings);
      const validListings = updatedListings.filter(listing => listing !== null);
      setListings(validListings);
      setNftCount(validListings.length);
    }
  };


  useEffect(() => {
    fetchListingsMetadata().then(() => { })
  }, [listingsData, contractAddress]);

  return (
    <div className='pt-[75px]'>
      <img className='w-full h-[400px] sm:h-[250px] object-cover z-0' src={collectionDetails?.coverImage} alt="Collection Cover" />
      {/* <img className='w-full h-[400px] sm:h-[250px] object-cover z-0' src={collectionDetails?.coverImage || require("../assets/fallback_cover.png")} alt="Collection Cover" /> */}

      <div className='flex justify-center items-center -mt-20 z-30 relative sm:px-5 sm:-mt-14'>
        <div className='w-[1257px] sm:w-full md:w-[95%]'>
          <div className='w-[160px] h-[160px] sm:w-[120px] sm:h-[120px] bg-white rounded-lg dark:bg-black-500 p-2 '>
            <img className='w-full h-full object-cover rounded-lg' src={collectionDetails?.image || require("../assets/IMG/pfp_not_found.png")} alt="Profile PFP" />
          </div>
          <div className='flex justify-between items-center mt-10 sm:mt-5'>
            <h1 className='flex justify-start items-center gap-4 text-black-400 font-Kallisto font-semibold text-[30px] dark:text-white uppercas sm:text-2xl'>{collectionName}
              <GoCheckCircleFill className='text-purple text-xl dark:bg-white rounded-full border-purple dark:border-[1px]' />
            </h1>

            <div className='flex justify-end items-center gap-3 sm:gap-1 sm:-mt-[120px]'>
              {collectionDetails.twitter && (
                <a href={collectionDetails.twitter} target="_blank" rel="noopener noreferrer">
                  <CiTwitter className='cursor-pointer text-2xl text-black-400 dark:text-grey-100' />
                </a>
              )}
              {collectionDetails.youtube && (
                <a href={collectionDetails.youtube} target="_blank" rel="noopener noreferrer">
                  <PiYoutubeLogoLight className='cursor-pointer text-2xl text-black-400 dark:text-grey-100' />
                </a>
              )}
              {collectionDetails.discord && (
                <a href={collectionDetails.discord} target="_blank" rel="noopener noreferrer">
                  <PiDiscordLogoLight className='cursor-pointer text-2xl text-black-400 dark:text-grey-100' />
                </a>
              )}
              {collectionDetails.telegram && (
                <a href={collectionDetails.telegram} target="_blank" rel="noopener noreferrer">
                  <PiTelegramLogoFill className='cursor-pointer text-2xl text-black-400 dark:text-grey-100' />
                </a>
              )}
            </div>
          </div>


          {showLess && <p className='mt-8 sm:mt-4 text-[15px] tracking-wide font-Kallisto font-medium text-black-400/75 dark:text-white sm:text-[12px]'>
            {collectionDetails?.description || "This collection has no description yet. Contact the owner of this collection to get whitelisted."}        </p>}
          <p onClick={() => setShowLess(s => !s)} className='text-[14px] cursor-pointer text-right tracking-wide font-Kallisto font-medium sm:text-[12px] text-blue-200 dark:text-blue-100 flex gap-2 justify-end items-center'>{showLess ? 'show less' : 'show more'} <IoIosArrowDown className={showLess && 'rotate-180'} /></p>


          {/* <div className='flex justify-start items-center gap-7 relative mt-10 sm:flex-col sm:justify-center sm:gap-2 sm:mt-5'>
            <span className='border-[1px] p-[2px] py-[3px] border-blue-100/90 hover:border-blue-100 sm:w-full'>
              <button className='bg-blue-100/90 text-white font-Kallisto uppercase font-normal text-[11px] sm:w-full tracking-wider hover:bg-blue-100 py-2 w-[300px] flex justify-center items-center gap-1'><PiRocketLaunchThin className="text-sm"/> Boost</button>
            </span>
            <CiCircleInfo className='cursor-pointer text-[16px] text-blue-100 info'/>
            <div className='opacity-0 border-grey-50 border-[1px] px-3 py-3 bg-white dark:bg-black-500 absolute -top-20 left-[200px] w-[280px] shadow-lg rounded-md sm:left-[30px] sm:-top-9'>
              <p className='text-[12px] tracking-wide font-Kallisto font-medium text-black-400 dark:text-white uppercase sm:text-[11px]'>Each boost is availbe for one month to give every collection a fair price</p>
            </div>
          </div> */}

          <div className='flex justify-start items-center gap-14 my-6 sm:flex-wrap sm:gap-7'>
            <span className='flex flex-col gap-2'>
              <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'> {parseFloat(ethers.utils.formatEther(String(collectionStats.totalVolumeTraded || "0"))).toFixed(5)} BTTC</p>
              <p className='text-[12px] tracking-wide font-Kallisto font-normal text-black-50 dark:text-white sm:text-[10px]'>TOTAL VOLUME</p>
            </span>
            <span className='flex flex-col gap-2'>
              <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'> {parseFloat(ethers.utils.formatEther(String(collectionStats.floorPrice || "0"))).toFixed(5)}</p>
              <p className='text-[12px] tracking-wide font-Kallisto font-normal text-black-50 dark:text-white sm:text-[10px]'>FLOOR PRICE</p>
            </span>
            <span className='flex flex-col gap-2'>
              <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'>{parseFloat(ethers.utils.formatEther(String(collectionStats.totalVolumeTradedWETH || "0"))).toFixed(5)}</p>
              <p className='text-[12px] tracking-wide font-Kallisto font-normal text-black-50 dark:text-white sm:text-[10px]'>WBTTC VOLUME</p>
            </span>
            <span className='flex flex-col gap-2'>
              <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'>{nftCount}</p>
              <p className='text-[12px] tracking-wide font-Kallisto font-normal text-black-50 dark:text-white sm:text-[10px]'>LISTED</p>
            </span>
            {/* <span className='flex flex-col gap-2'>
            <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'>7589</p>
            <p className='text-[12px] tracking-wide font-Kallisto font-normal text-black-50 dark:text-white sm:text-[10px]'>Total Volume</p>
          </span> */}
          </div>


          <div className='flex justify-center items-start'>
            <div className='w-[1257px] overflow-hidden md:w-[95%]'>
              <div className={`mt-6 flex justify-center items-start gap-9`}>
                {sidebar && <span className='w-[287px] sm:w-full sm:top-[45px] overflow-hidden sm:fixed sm:z-50 sm:h-screen'>
                  <div className='relative z-30 border-[1px]  rounded-md bg-white dark:bg-transparent sm:dark:bg-black-600 border-grey-50'>
                    <div className='px-5 py-2  flex justify-between items-center gap-3 cursor-pointer' onClick={() => setSideBar(s => !s)}>
                      <p className='text-[13px] font-medium tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100'>Filter</p>
                      <RxCross2 className={` hidden sm:flex text-xl text-black-50 dark:text-white transition-all ease-in duration-100`} />
                      <IoIosArrowDown className={`sm:hidden text-base text-black-50 dark:text-white transition-all ease-in duration-100 ${sidebar ? 'rotate-180' : ''}`} />
                    </div>
                    {sidebar && <div className='px-5 flex flex-col gap-5 mt-2 pb-10 sm:h-screen'>

                      <Card2 title="PRICE">
                        <div className='flex flex-col gap-2'>
                          <div className='flex justify-between gap-2'>
                            <input type='number' className='border-grey-50 border-[1px] outline-none w-[50%] rounded-md p-.5 px-3 bg-transparent text-sm font-Kallisto text-black-50 dark:text-grey-100' placeholder='MIN' />
                            <input type='number' className='border-grey-50 border-[1px] outline-none w-[50%] rounded-md p-1.5 px-3 bg-transparent text-sm font-Kallisto text-black-50 dark:text-grey-100' placeholder='MAX' />
                          </div>
                        </div>
                      </Card2>

                      <div className='flex justify-between items-center'>
                        <p className='uppercase font-Kallisto font-semibold cursor-pointer dark:text-grey-100 text-black-400 tracking-wider text-[10px] underline'>clear</p>
                        <p className='uppercase font-Kallisto font-semibold cursor-pointer dark:text-blue-100 text-blue-200 tracking-wider text-[10px] underline'>apply</p>
                      </div>


                    </div>}
                  </div>
                </span>}

                <div className={`${sidebar ? 'w-[75%]' : 'w-full'} self-end sm:w-full`}>
                  <div className={`flex ${sidebar ? 'justify-end' : 'justify-between'} items-stretch gap-9 sm:flex-col sm:gap-2`}>
                    {!sidebar && <span className='w-[282px] sm:hidden '>
                      <div className='relative w-full z-30 border-[1px]  rounded-md bg-white dark:bg-black-600 border-grey-50'>
                        <div className='px-5 py-2  flex justify-between items-center gap-3 cursor-pointer' onClick={() => setSideBar(s => !s)}>
                          <p className='text-[12px] font-medium tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100'>Filter</p>
                          <IoIosArrowDown className={`text-base text-black-50 dark:text-grey-100 transition-all ease-in duration-100 ${sidebar ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </span>}
                    {/* <span className={`rounded-md border-grey-50 py-1.5 px-2 gap-3 bg-white border-[1px] sm:w-full w-[610px] flex justify-start items-center dark:bg-black-600`}>
              <CiSearch className='text-black-50 text-2xl' />
              <input type='text' className='outline-none text-black-50 bg-transparent w-[100%]  font-Kallisto text-sm font-normal tracking-wider' placeholder='Search by Name' />
            </span> */}
                    <span className={`w-[282px] sm:hidden`}>
                      <Dropdown transparent={true} placeHolder={"Filter"} options={[{ id: 'Trending', value: 'Price low to hight' }, { id: 'Top', value: 'price high to low' }]} selectedOption={() => { }} />
                    </span>
                    <div className='justify-between items-center gap-2 hidden sm:flex'>
                      <span className={`w-[282px] sm:w-[50%]`}>
                        <Dropdown transparent={true} placeHolder={"Filter"} options={[{ id: 'Trending', value: 'Price low to hight' }, { id: 'Top', value: 'price high to low' }]} selectedOption={() => { }} />
                      </span>
                      <span className='w-[282px] sm:w-[50%] hidden sm:flex '>
                        <div className='relative w-full z-30 border-[1px]  rounded-md bg-white dark:bg-black-600 border-grey-50'>
                          <div className='px-5 py-2  flex justify-between items-center gap-3 cursor-pointer' onClick={() => setSideBar(s => !s)}>
                            <p className='text-[12px] font-medium tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100'>Filter</p>
                            <IoIosArrowDown className={`text-base text-black-50 dark:text-grey-100 transition-all ease-in duration-100 ${sidebar ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </span>
                    </div>
                  </div>

                  <div className='flex justify-start mb-20'>
                    <div className={`flex justify-start items-stretch gap-9 sm:gap-2 flex-wrap mt-9 sm:mt-4`}>
                      {listings.map((listing, index) => {
                        return (
                          <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                            <Link to={`/collection/${contractAddress}/${listing.tokenId}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                              <img src={listing.image} alt={listing.name} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                            </Link>
                            <div className='px-6 py-4 sm:px-3 sm:py-22'>
                              <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{listing.name}
                                <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                              </h1>
                              <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 dark:text-white sm:text-sm flex items-center gap-1'>
                                <img src={require('../assets/logo/bttc.png')} alt="BTTC Logo" className='w-5 h-5' />
                                {ethers.utils.formatEther(String(listing.price))} BTTC
                              </p>
                              <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:text-[10px]'>Last Sale $ 80</p>
                            </div>
                            <BuyNow
                              erc721Address={contractAddress}
                              tokenId={listing.tokenId}
                              price={listing.price}
                              className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'
                              onSuccess={() => {
                                fetchListingsMetadata().then(() => { })
                              }}
                            />
                          </div>
                        );
                      })}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collection
