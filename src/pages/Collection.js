import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CiCircleInfo, CiTwitter } from 'react-icons/ci'
import { GoCheckCircleFill } from 'react-icons/go'
import { IoIosArrowDown } from 'react-icons/io'
import { PiDiscordLogoLight, PiTelegramLogoFill, PiYoutubeLogoLight, PiGlobe, PiRocketLaunchThin } from 'react-icons/pi'
import { Link } from 'react-router-dom'
import Dropdown from '../components/Dropdown'
import Card2 from '../components/Card2'
import { RxCross2 } from 'react-icons/rx'

import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import ERC721ABI from '../abi/erc721.json';

import Nft from "../utils/Nft"; //middleware api for getting nft img, metadata and owner
import MarketplaceApi from "../utils/MarketplaceApi"; //middleware api for getting nft details and collection stats
import whitelist from '../components/whitelist';

import BuyNow from '../components/Market/BuyNow';
import ListNFTModal from '../components/Market/ListNFTModal';
import DeListNFTModal from '../components/Market/DeListNFTModal';



function Collection() {
  const [showLess, setShowLess] = useState(true)
  const [sidebar, setSideBar] = useState(window.innerWidth < 768 ? false : true)

  const { active, account } = useWallet();

  let { contractAddress } = useParams();
  contractAddress = contractAddress.toLowerCase();
  const [collectionName, setCollectionName] = useState('');
  const [listings, setListings] = useState([]);
  const [listingsData, setListingsData] = useState({ listings: [] });
  const [isSeller, setIsSeller] = useState(false);


  const [collectionDetails, setCollectionDetails] = useState({});
  const [nftCount, setNftCount] = useState(0); //updates Listings count to display :)
  const [currentSection, setCurrentSection] = useState('sales'); // New state for toggling sections

  //states for owned NFTs
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [fetchingOwnedNfts, setFetchingOwnedNfts] = useState(false);

  //listing nft
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState({});

  //cancel lising
  const [isCancelBidModalOpen, setIsCancelBidModalOpen] = useState(false);




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
        const nftInstance = new Nft(199, contractAddress);
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


  //fetch listing metadata
  const fetchListingsMetadata = async () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (listingsData && listingsData.listings) {
      console.log("Processing listings data...");
      let sellerIsCurrentUser = false;  // Flag to check if the current user is the seller

      const updatedListings = await Promise.all(
        listingsData.listings
          .filter(listing => parseInt(listing.expireTimestamp) > currentTimestamp)
          .map(async (listing) => {
            const uniqueId = `${contractAddress}-${listing.tokenId}`;

            // Check if the current user is the seller
            if (account && listing.seller && listing.seller.toLowerCase() === account.toLowerCase()) {
              sellerIsCurrentUser = true;
            }

            // Start fetch or await existing fetch
            if (!metadataCache[uniqueId]) {
              // Store the fetch promise itself in the cache
              const fetchPromise = (async () => {
                try {
                  const nft = new Nft(199, contractAddress, listing.tokenId);
                  const metadata = await nft.metadata();
                  const image = nft.image();
                  console.log("Metadata retrieved:", uniqueId);
                  const checksumAddress = ethers.utils.getAddress(contractAddress);
                  const lastSale = await MarketplaceApi.fetchLastSaleForNFT(checksumAddress, listing.tokenId);
                  // console.log('API call returned for Last Sale:', lastSale);

                  // Once the data is fetched, replace the promise with actual data
                  metadataCache[uniqueId] = metadata;
                  imageCache[uniqueId] = image;

                  return {
                    ...listing,
                    image: image,
                    name: metadata.name,
                    lastSale: lastSale ? lastSale.price : null
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
      console.log("Is current user the seller? ", sellerIsCurrentUser);  // Log the status of the current user being a seller

      const validListings = updatedListings.filter(listing => listing !== null);
      setListings(validListings);
      setNftCount(validListings.length);
      setIsSeller(sellerIsCurrentUser);
    }
  };


  useEffect(() => {
    fetchListingsMetadata().then(() => { })
  }, [listingsData, contractAddress]);

  // fetch owned NFT & metadata
  const fetchOwnedMetadata = useCallback(async () => {
    if (!account) return; // Make sure the user's wallet is connected

    setFetchingOwnedNfts(true);
    try {
      const contract = new ethers.Contract(contractAddress, ERC721ABI, new ethers.providers.Web3Provider(window.ethereum));
      const balance = await contract.balanceOf(account);
      console.log(`Balance for account: ${balance.toNumber()}`);

      if (balance.toNumber() === 0) {
        setFetchingOwnedNfts(false);
        return; // The user does not own any NFTs in this collection
      }

      const tokenIdsPromises = [];
      for (let i = 0; i < balance.toNumber(); i++) {
        tokenIdsPromises.push(contract.tokenOfOwnerByIndex(account, i));
      }
      const tokenIds = await Promise.all(tokenIdsPromises);

      const ownedNftsMetadata = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const nftInstance = new Nft(199, contractAddress, tokenId.toString());
            const metadata = await nftInstance.metadata();
            const image = nftInstance.image();
            const checksumAddress = ethers.utils.getAddress(contractAddress);
            const lastSale = await MarketplaceApi.fetchLastSaleForNFT(checksumAddress, tokenId.toString());

            return {
              contractAddress,
              tokenId: tokenId.toString(),
              image,
              name: metadata.name,
              lastSale: lastSale ? lastSale.price : null
            };
          } catch (error) {
            console.error("Error fetching NFT metadata:", error);
            return null;
          }
        })
      );

      setOwnedNfts(ownedNftsMetadata.filter(nft => nft !== null)); // Filter out any failed fetches
      console.log('Owned NFTs:', ownedNftsMetadata.filter(nft => nft !== null));
    } catch (error) {
      console.error("Failed to fetch owned NFTs:", error);
    } finally {
      setFetchingOwnedNfts(false);
    }
  }, [account, contractAddress]);


  useEffect(() => {
    if (account && currentSection === 'mynft') {
      fetchOwnedMetadata();
    }
  }, [account, currentSection, fetchOwnedMetadata]);



  const handleSectionChange = (section) => {
    setCurrentSection(section);
  };

  const handleListForSaleClick = (nft) => {
    console.log("Listing NFT:", nft);
    setSelectedNFT(nft);
    setIsListModalOpen(true);
  };

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

  const nftStateUpdated = async function () {
    console.log('Nft state updated')
    // Refetch  data
    fetchOwnedMetadata().then(() => { })
    fetchListingsMetadata().then(() => { })
  }


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
            {/* <h1 className='flex justify-start items-center gap-4 text-black-400 font-Kallisto font-semibold text-[30px] dark:text-white uppercas sm:text-2xl'>{collectionName}
              <GoCheckCircleFill className='text-purple text-xl dark:bg-white rounded-full border-purple dark:border-[1px]' />
            </h1> */}
            <h1 className='flex justify-start items-center gap-4 text-black-400 font-Kallisto font-semibold text-[30px] dark:text-white uppercas sm:text-2xl'>
              {collectionName}
              {/* Conditionally render GoCheckCircleFill if the contract address is in the whitelist */}
              {Object.values(whitelist).some(entry => entry.address.toLowerCase() === contractAddress) && (
                <GoCheckCircleFill className='text-purple text-xl dark:bg-white rounded-full border-purple dark:border-[1px]' />
              )}
            </h1>


            <div className='flex justify-end items-center gap-3 sm:gap-1 sm:-mt-[120px]'>
              {collectionDetails.website && (
                <a href={collectionDetails.website} target="_blank" rel="noopener noreferrer">
                  <PiGlobe className='cursor-pointer text-2xl text-black-400 dark:text-grey-100' />
                </a>
              )}
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

          {/* 
          <div className='flex justify-start items-center gap-7 relative mt-10 sm:flex-col sm:justify-center sm:gap-2 sm:mt-5'>
            <span className='border-[1px] p-[2px] py-[3px] border-blue-100/90 hover:border-blue-100 sm:w-full'>
              <button className='bg-blue-100/90 text-white font-Kallisto uppercase font-normal text-[11px] sm:w-full tracking-wider hover:bg-blue-100 py-2 w-[300px] flex justify-center items-center gap-1'><PiRocketLaunchThin className="text-sm" /> Boost</button>
            </span>
            <CiCircleInfo className='cursor-pointer text-[16px] text-blue-100 info' />
            <div className='opacity-0 border-grey-50 border-[1px] px-3 py-3 bg-white dark:bg-black-500 absolute -top-20 left-[200px] w-[280px] shadow-lg rounded-md sm:left-[30px] sm:-top-9'>
              <p className='text-[12px] tracking-wide font-Kallisto font-medium text-black-400 dark:text-white uppercase sm:text-[11px]'>Each boost is availbe for one month to give every collection a fair price</p>
            </div>
          </div> */}

          <div className='flex justify-start items-center gap-14 my-6 sm:flex-wrap sm:gap-7'>
            <span className='flex flex-col gap-2'>
              <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'> {formatPrice(parseFloat(ethers.utils.formatEther(String(collectionStats.totalVolumeTraded || "0"))).toFixed(2))} BTTC</p>
              <p className='text-[12px] tracking-wide font-Kallisto font-normal text-black-50 dark:text-white sm:text-[10px]'>TOTAL VOLUME</p>
            </span>
            <span className='flex flex-col gap-2'>
              <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'> {formatPrice(parseFloat(ethers.utils.formatEther(String(collectionStats.floorPrice || "0"))).toFixed(2))}</p>
              <p className='text-[12px] tracking-wide font-Kallisto font-normal text-black-50 dark:text-white sm:text-[10px]'>FLOOR PRICE</p>
            </span>
            <span className='flex flex-col gap-2'>
              <p className='text-xl tracking-wide font-Kallisto font-semibold text-black-400 dark:text-white sm:text-base'>{formatPrice(parseFloat(ethers.utils.formatEther(String(collectionStats.totalVolumeTradedWETH || "0"))).toFixed(2))}</p>
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

          {/* state for sales and mynft */}
          {/* <div className='flex justify-center items-center mt-4 mb-4'> */}
          <div className='flex justify-start items-center mt-4 mb-4'>
            <button
              className={`px-3 py-1 text-lg font-Kallisto font-bold tracking-wide transition duration-300 ${currentSection === 'sales' ? 'text-blue-200 dark:text-blue-100 border-b-4 border-blue-200 dark:border-blue-100' : 'text-grey-100 dark:text-black-50'}`}
              onClick={() => handleSectionChange('sales')}
            >
              SALES
            </button>
            <button
              className={`px-3 py-1 text-lg font-Kallisto font-bold tracking-wide transition duration-300 ${currentSection === 'mynft' ? 'text-blue-200 dark:text-blue-100 border-b-4 border-blue-200 dark:border-blue-100' : 'text-grey-100 dark:text-black-50'}`}
              onClick={() => handleSectionChange('mynft')}
            >
              MY NFTs
            </button>
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

                  {/* SHOW LISTED NFT/ ON SALES NFT */}
                  <div className='flex justify-start mb-20'>
                    <div className={`flex justify-start items-stretch gap-9 sm:gap-2 flex-wrap mt-9 sm:mt-4`}>
                      {currentSection === 'sales' && listings.map((listing, index) => {
                        return (
                          <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                            <Link to={`/collection/${contractAddress}/${listing.tokenId}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                              <img src={listing.image} alt={listing.name} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                            </Link>
                            <div className='px-6 py-4 sm:px-3 sm:py-22'>
                              <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{listing.name}
                                <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                              </h1>
                              <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 text-grey-100 dark:text-white sm:text-sm flex items-center gap-1'>
                                <img src={require('../assets/logo/bttc.png')} alt="BTTC Logo" className='w-5 h-5' />
                                {/* {ethers.utils.formatEther(String(listing.price))}  */}
                                {formatPrice(parseFloat(ethers.utils.formatEther(String(listing.price))).toFixed(2))} BTTC
                              </p>
                              <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:text-[10px]'>
                                {listing.lastSale ? `Last Sale ${parseFloat(ethers.utils.formatEther(String(listing.lastSale))).toFixed(2)}` : "No sales yet"}
                              </p>
                            </div>
                            <BuyNow
                              erc721Address={contractAddress}
                              tokenId={listing.tokenId}
                              price={listing.price}
                              className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'
                              // onSuccess={() => {
                              //   nftStateUpdated().then(() => { })
                              // }}
                              onSuccess={() => {
                                setTimeout(() => {
                                  nftStateUpdated().then(() => { })
                                }, 500);
                              }}
                            />
                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* SHOW NFT IN WALLET */}
                  <div className='flex justify-start mb-0'>
                    <div className={`flex justify-start items-stretch gap-9 sm:gap-2 flex-wrap mt-1 sm:mt-4`}>
                      {currentSection === 'mynft' && ownedNfts.map((nft, index) => {
                        return (
                          <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                            <Link to={`/collection/${contractAddress}/${nft.tokenId}`} className='h-[250px] sm:h-[100px] overflow-hidden'>
                              <img src={nft.image} alt={nft.name} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                            </Link>
                            <div className='px-6 py-4 sm:px-3 sm:py-22'>
                              <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{nft.name}
                                <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                              </h1>
                              <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:text-[10px]'>
                                {nft.lastSale ? `Last Sale ${parseFloat(ethers.utils.formatEther(String(nft.lastSale))).toFixed(2)}` : "No sales yet"}
                              </p>
                            </div>
                            <ListNFTModal
                              isOpen={isListModalOpen}
                              onClose={() => {
                                setIsListModalOpen(false)
                                fetchOwnedMetadata().then(() => { });
                              }}
                              contractAddress={selectedNFT?.contractAddress}
                              tokenId={selectedNFT?.tokenId}
                            />
                            <button onClick={() => handleListForSaleClick(nft)} className='bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'>
                              <p className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider'>
                                {"List For Sale"}
                              </p>
                            </button>
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
