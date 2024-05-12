import React, { useState, useEffect } from 'react';
import { GoCheckCircleFill } from 'react-icons/go'
import { Link, useParams } from 'react-router-dom'
import { FiRefreshCcw } from "react-icons/fi";
import { CiShare2 } from 'react-icons/ci';
import Card from '../components/Card';
import { BsArrowsAngleExpand } from "react-icons/bs";
import useDisclosure from '../hooks/useDisclosure';

// web3 - subgraph
import Nft from "../utils/Nft";
import MarketplaceApi from "../utils/MarketplaceApi"; // Ensure this is imported
import whitelist from '../components/whitelist';


import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
//marketplace
import BuyNow from '../components/Market/BuyNow';
import MakeOffer from '../components/Market/MakeOffer';
import AcceptOffer from '../components/Market/AcceptOffer';
import DeListNFTModal from '../components/Market/DeListNFTModal';
import ListNFTModal from '../components/Market/ListNFTModal';

import { Helmet } from 'react-helmet'; // seo mark






function NFTDetail() {
  const [image, setImage] = useState(null)
  let { contractAddress, tokenId } = useParams();
  contractAddress = contractAddress.toLowerCase();
  const { active, account } = useWallet();
  const [nftDetails, setNftDetails] = useState({});
  const [isListed, setIsListed] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  //
  const { isOpen: isOfferOpen, onOpen: onOfferOpen, onClose: onOfferClose } = useDisclosure();
  const [selectedBid, setSelectedBid] = useState(null);
  const { isOpen: isAcceptOfferOpen, onOpen: onAcceptOfferOpen, onClose: onAcceptOfferClose } = useDisclosure();

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isCancelBidModalOpen, setIsCancelBidModalOpen] = useState(false);

  const [listingData, setListingData] = useState(null);
  const [bidsData, setBidsData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  //usd price
  const [bttToUsdPrice, setBttToUsdPrice] = useState(null);



  const fetchActiveListing = async () => {
    try {
      const checksumAddress = ethers.utils.getAddress(contractAddress);
      const listing = await MarketplaceApi.fetchActiveListingForNFT(checksumAddress, tokenId);
      setListingData(listing);
    } catch (error) {
      //console.error("Failed to fetch active listing:", error);
    }
  };

  const fetchActiveBids = async () => {
    try {
      const checksumAddress = ethers.utils.getAddress(contractAddress);
      const bids = await MarketplaceApi.fetchActiveBidsForNFT(checksumAddress, tokenId);
      setBidsData(bids);
    } catch (error) {
      //console.error("Failed to fetch active bids:", error);
      setBidsData([]); // Consider clearing the bids data or handling errors differently as per your needs
    }
  };


  const fetchSalesData = async () => {
    try {
      const checksumAddress = ethers.utils.getAddress(contractAddress);
      const sales = await MarketplaceApi.fetchNFTSales(checksumAddress, tokenId);
      setSalesData(sales);
    } catch (error) {
      //console.error("Failed to fetch sales data:", error);
      // Handle the error as needed, e.g., by setting sales data to an empty array or showing an error message
      setSalesData([]);
    }
  };

  useEffect(() => {
    if (contractAddress && tokenId) {
      fetchSalesData();
      fetchActiveListing();
      fetchActiveBids();
    }
  }, [contractAddress, tokenId]);


  //price section 
  useEffect(() => {
    const fetchBttPrice = async () => {
      try {
        const price = await MarketplaceApi.fetchCurrentPrice();
        setBttToUsdPrice(price);
      } catch (error) {
        console.error("Failed to fetch BTT price", error);
      }
    };

    fetchBttPrice();
  }, []);


  //price section - format to usd 
  const formatPriceWithUSD = (bttAmount) => {
    const num = parseFloat(bttAmount);
    const formattedBTT = formatPrice(num);

    const priceInUSD = bttToUsdPrice ? (
      <span style={{ fontSize: 'small', fontWeight: 'normal', color: '#6b7280' }}>
        (${(num * bttToUsdPrice).toFixed(3)})
      </span>
    ) : "(USD not available)";

    return <span>{formattedBTT} {priceInUSD}</span>;
  };



  // Utility function to format the timestamp
  const formatDate = (timestamp) => {
    // convert from string to number if necessary.
    const dateInput = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

    const now = new Date();
    const eventDate = new Date(dateInput);
    if (isNaN(eventDate.getTime())) {
      return "Invalid date";
    }

    const diffInSeconds = Math.floor((now - eventDate) / 1000);
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;

    if (diffInSeconds < minute) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < hour) {
      return `${Math.floor(diffInSeconds / minute)} minutes ago`;
    } else if (diffInSeconds < day) {
      return `${Math.floor(diffInSeconds / hour)} hours ago`;
    } else if (diffInSeconds < month) {
      return `${Math.floor(diffInSeconds / day)} days ago`;
    } else if (diffInSeconds < year) {
      return `${Math.floor(diffInSeconds / month)} months ago`;
    } else {
      return `${Math.floor(diffInSeconds / year)} years ago`;
    }
  };


  const handleSelectBid = (bid) => {
    setSelectedBid(bid);
    onAcceptOfferOpen();
  };

  // Utility function to format addresses
  const formatAddressSOLD = (address) => `${address.slice(0, 3)}...${address.slice(-3)}`;

  const formatAddress = (address) => {
    // Check if the address is null or undefined before proceeding
    if (!address) return "Loading...";
    return `${address.slice(0, 5)}...${address.slice(-3)}`;
  };

  // Utility function to format expiration timestamp
  const formatExpiration = (expireTimestamp) => {
    const expiryDate = new Date(expireTimestamp * 1000);
    const now = new Date();
    const diff = expiryDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    if (minutes > 0) return `${minutes} minutes`;
    return "Expired";
  };

  // useEffect(() => {
  //   if (data && data.listings && data.listings.length > 0) {
  //     setIsListed(true);
  //     setIsSeller(account && data.listings[0].seller.toLowerCase() === account.toLowerCase());
  //   } else {
  //     setIsListed(false);
  //     setIsSeller(false); // Ensure isSeller is reset if there's no listing
  //   }
  // }, [data, account]);
  useEffect(() => {
    if (listingData) {
      setIsListed(true);
      setIsSeller(account && listingData.seller.toLowerCase() === account.toLowerCase());
      // Update NFT details state as needed, particularly if you were extracting price or other listing details from the data
    } else {
      setIsListed(false);
      setIsSeller(false); // Reset isSeller if there's no active listing
    }
  }, [listingData, account]);



  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!contractAddress || !tokenId) return;

      try {
        const nft = new Nft(199, contractAddress, tokenId);
        const metadata = await nft.metadata();

        // Adjust price extraction logic based on the new listingData state
        const price = listingData ? ethers.utils.formatUnits(String(listingData.price, 'ether')) : null; //{ethers.utils.formatEther(String(bid.value))}

        let owner = null;
        if (active) { // Only attempt to fetch owner if wallet is connected
          owner = await nft.owner();
          setIsOwner(account && owner.toLowerCase() === account.toLowerCase());
        }

        setNftDetails({
          ...metadata,
          owner,
          image: nft.image(),
          price,
        });
      } catch (error) {
        console.error("Failed to fetch NFT details", error);
      }
    };

    fetchNFTDetails();
  }, [contractAddress, tokenId, listingData, active, account]);



  // const nftStateUpdated = async () => {
  //   console.log('Nft state updated');
  //   fetchActiveListing().then(() => {
  //     console.log('Listing data refetched');
  //   });
  //   await fetchActiveBids(); // Add this line to fetch bids data again
  //   console.log('Bids data refetched');
  //   //refetchSalesData().then(() => { })
  //   await fetchSalesData();
  // };

  const nftStateUpdated = async function () {
    console.log('Nft state updated')
    // Refetch  data
    fetchActiveListing().then(() => { })
    fetchActiveBids().then(() => { })
    fetchSalesData().then(() => { })
  }

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

  //format large tokenid like domain names
  const formatTokenId = (tokenId) => {
    const tokenIdStr = tokenId.toString();
    const maxLength = 9;

    if (tokenIdStr.length <= maxLength) {
      return tokenIdStr;
    }

    const start = tokenIdStr.substring(0, 5);
    const end = tokenIdStr.substring(tokenIdStr.length - 1, tokenIdStr.length);
    return `${start}...${end}`;
  };


  return (
    <>


      <Helmet>
        <title>{nftDetails.name}</title>
        <meta name="description" content={nftDetails.description} />
      </Helmet>

      <div className='flex justify-between items-start gap-8 sm:gap-5 py-20 sm:py-16 px-28 sm:px-5 sm:pb-10 sm:flex-col-reverse'>
        <div className='w-[47%] flex flex-col gap-9 sm:gap-5 sm:w-full'>
          {/* NFT IMAGE SECTION */}
          {nftDetails.image &&
            <div className='sm:hidden relative h-[600px] cursor-pointer sm:h-[300px]' onClick={() => setImage(nftDetails.image)}>
              <img className='rounded-lg w-full h-full object-cover' src={nftDetails.image || "../assets/IMG/pfp_not_found.png"} alt={nftDetails.name} />
              <div className='absolute w-full h-full bg-black-400/30 top-0 left-0 opacity-0 hover:opacity-100 transition-all ease-in duration-150 flex justify-center items-center'>
                <span className='bg-grey-100/30 p-5 rounded-full flex justify-center items-center'>
                  <BsArrowsAngleExpand className='text-white text-lg' />
                </span>
              </div>
            </div>
          }

          {/* DESCRIPTION SECTION  */}

          <Card title="ABOUT">
            <p className='text-[15px] sm:text-[12px] tracking-wide font-Kallisto font-normal text-black-400 dark:text-white'> {nftDetails.description} </p>
          </Card>

          {/* ATTRIBUTES OR TRAITS */}
          <Card title="ATTRIBUTES">
            <div className='flex justify-start items-start gap-3 flex-wrap sm:gap-2'>
              {nftDetails.attributes?.map((attr, index) => (
                <div key={index} className='flex justify-start items-start gap-3 flex-wrap'>
                  <div className='rounded-md bg-grey-100/5 dark:bg-black-500 p-5 flex flex-col gap-1 cursor-pointer min-w-[110px] sm:max-w-[120px] sm:p-3 hover:bg-white hover:shadow-lg transition-all ease-in duration-100'>
                    <p className='text-[10px] font-Kallisto tracking-wider font-semibold capitalize text-black-50 dark:text-grey-100'>{attr.trait_type}</p>
                    <p className='text-[12px] font-Kallisto font-medium tracking-wide capitalize text-black-400 dark:text-white'>{attr.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div >

        <div className='w-[53%] flex flex-col gap-2 sm:w-full'>

          <Link to={`/collection/${contractAddress}`} className='text-[12px] sm:text-[10px] text-blue-200 dark:text-blue-100 capitalize font-Kallisto font-medium underline flex items-center gap-2'>
            {/* using {nftDetails.name} to get the collection name while remove the part after and including the "#" character. */}
            {nftDetails.name ? nftDetails.name.split(" #")[0] : "Loading..."}
            {/* Conditionally render GoCheckCircleFill if the contract address is in the whitelist */}
            {Object.values(whitelist).some(entry => entry.address.toLowerCase() === contractAddress) && (
              <GoCheckCircleFill className='text-blue-200 text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
            )}
          </Link>

          <div className='flex justify-between items-center relative'>
            <h1 className='text-black-400 font-Kallisto text-2xl font-semibold dark:text-white uppercase sm:text-base'>{nftDetails.name}</h1>
            <div className='flex justify-end items-center gap-3 sm:absolute sm:right-0 -top-7 sm:gap-1'>
              {/* <FiRefreshCcw className='cursor-pointer text-lg sm:text-sm text-black-50 dark:text-grey-100' /> */}
              <FiRefreshCcw
                className='cursor-pointer text-lg sm:text-sm text-black-50 dark:text-grey-100'
                onClick={nftStateUpdated} // Call nftStateUpdated when the icon is clicked
              />
              <CiShare2 className='cursor-pointer text-2xl sm:text-lg text-black-50 dark:text-grey-100' />
            </div>
          </div>

          <div className='hidden sm:flex relative h-[600px] cursor-pointer sm:h-[300px]' onClick={() => setImage(nftDetails.image)}>
            <img className=' rounded-lg w-full h-full object-cover' src={nftDetails.image} alt={nftDetails.name} />
            <div className='absolute w-full h-full bg-black-400/30 top-0 left-0 opacity-0 hover:opacity-100 transition-all ease-in duration-150 flex justify-center items-center'>
              <span className='bg-grey-100/30 p-5 rounded-full flex justify-center items-center'>
                <BsArrowsAngleExpand className='text-white text-lg' />
              </span>
            </div>
          </div>

          <div className='rounded-lg border-grey-50 py-3 px-5 gap-3 sm:gap-2 sm:p-5 bg-white border-[1px] flex dark:bg-transparent mt-6 flex-col'>
            <div className='flex justify-start items-center gap-5 sm:gap-3'>
              <h1 className='text-black-400 font-Kallisto text-base font-medium dark:text-white uppercase sm:text-[12px]'>
                {isListed ? "ON SALE FOR" : "NOT LISTED"}
              </h1>
              {isListed && (
                <h1 className='text-black-400 font-Kallisto text-base font-medium dark:text-white uppercase sm:text-[12px] flex items-center gap-1'>
                  <img src={require('../assets/logo/bttc.png')} alt="BTTC Logo" className='w-5 h-5' />
                  {/* {formatPrice(nftDetails.price)} BTTC */}
                  {formatPriceWithUSD(nftDetails.price)}
                </h1>
              )}
            </div>
            {/* {active && nftDetails.price && isListed && !isSeller && ( */}
            {nftDetails.price && isListed && !isSeller && (
              <BuyNow
                erc721Address={contractAddress}
                tokenId={tokenId}
                price={ethers.utils.parseUnits(nftDetails.price, 'ether')}
                className='mt-3 sm:mt-1 sm:text-[10px] bg-black px-11 py-[10px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[12px] uppercase font-Kallisto font-medium tracking-widest text-white cursor-pointer outline-none hover:text-black-400 hover:bg-grey-100/20 hover:text-black transition-all ease-linear duration-150 dark:hover:text-white dark:hover:bg-grey-100'
                onSuccess={() => {
                  setTimeout(() => {
                    nftStateUpdated().then(() => { })
                  }, 500);
                }}
              />
            )}
            {/* Make an Offer Button */}
            {!isOwner && !isSeller && (
              <button
                className='bg-black sm:text-[10px] px-11 py-[10px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[12px] uppercase font-Kallisto font-medium tracking-widest text-white cursor-pointer outline-none hover:text-black-400 hover:bg-grey-100/20 hover:text-black transition-all ease-linear duration-150 dark:hover:text-white dark:hover:bg-grey-100'
                onClick={onOfferOpen} // Open the MakeOffer modal
              >
                Make an Offer
              </button>
            )}
            <MakeOffer
              isOpen={isOfferOpen}
              onClose={onOfferClose}
              erc721Address={contractAddress}
              tokenId={tokenId}
              nft={{ name: nftDetails.name, image: nftDetails.image }}
            />
            {/* Conditional show Listing Button or cancel listing if owner or seller is connected */}
            {active && isListed && isSeller && (
              <button
                className='bg-black sm:text-[10px] px-11 py-[10px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[12px] uppercase font-Kallisto font-medium tracking-widest text-white cursor-pointer outline-none hover:text-black-400 hover:bg-grey-100/20 hover:text-black transition-all ease-linear duration-150 dark:hover:text-white dark:hover:bg-grey-100'
                onClick={() => setIsCancelBidModalOpen(true)}
              >
                Cancel Listing
              </button>
            )}
            <DeListNFTModal
              isOpen={isCancelBidModalOpen}
              onClose={() => {
                setIsCancelBidModalOpen(false)
                setTimeout(() => {
                  nftStateUpdated().then(() => { })
                }, 500)
              }}
              contractAddress={contractAddress}
              tokenId={tokenId}
            />

            {active && !isListed && isOwner && (
              <button
                className='bg-black sm:text-[10px] px-11 py-[10px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[12px] uppercase font-Kallisto font-medium tracking-widest text-white cursor-pointer outline-none hover:text-black-400 hover:bg-grey-100/20 hover:text-black transition-all ease-linear duration-150 dark:hover:text-white dark:hover:bg-grey-100'
                onClick={() => setIsListModalOpen(true)}
              >
                List for Sale
              </button>
            )}
            <ListNFTModal
              isOpen={isListModalOpen}
              onClose={() => {
                setIsListModalOpen(false)
                setTimeout(() => {
                  nftStateUpdated().then(() => { })
                }, 500);
              }}
              contractAddress={contractAddress}
              tokenId={tokenId}
            />
          </div>

          <div className='flex flex-col gap-9 sm:gap-5 mt-8 sm:mt-4'>
            {/* <NFTDetails /> */}
            <Card title="Details">
              <div className='mt-2 flex flex-col gap-2'>
                <div className='flex justify-between items-center'>
                  <p className='text-[12px] text-black-50 dark:text-grey-100 font-Kallisto font-medium'>Token ID</p>
                  <p className='text-[12px] text-black-400 cursor-pointer font-semibold dark:text-white font-Kallisto underline hover:no-underline'>{formatTokenId(tokenId)}</p>
                </div>
                <div className='flex justify-between items-center'>
                  <p className='text-[12px] text-black-50 dark:text-grey-100 font-Kallisto font-medium'>Token standard</p>
                  <p className='text-[12px] text-black-400 cursor-pointer font-medium dark:text-white font-Kallisto '>ERC-721</p>
                </div>
                <div className='flex justify-between items-center'>
                  <p className='text-[12px] text-black-50 dark:text-grey-100 font-Kallisto font-medium'>Owner</p>
                  <p className='text-[12px] text-black-400 cursor-pointer font-semibold dark:text-white font-Kallisto underline hover:no-underline'>{formatAddress(nftDetails.owner)}</p>
                </div>
                {/* <div className='flex justify-between items-center'>
                <p className='text-[12px] text-black-50 dark:text-grey-100 font-Kallisto font-medium'>Royalties</p>
                <p className='text-[12px] text-black-400 cursor-pointer font-medium dark:text-white font-Kallisto '>7 %</p>
              </div> */}
                {/* 
              <div className='flex justify-between items-center'>
                <p className='text-[12px] text-black-50 dark:text-grey-100 font-Kallisto font-medium'>NFT Rank</p>
                <p className='text-[12px] text-black-400 cursor-pointer font-medium dark:text-white font-Kallisto '>7582</p>
              </div> */}

              </div>
              {/* <Offers /> */}
            </Card>
            <Card title="Offers">
              <div className="min-h-[50px] max-h-[200px] overflow-y-scroll sm:overflow-x-scroll">
                <table className='w-full'>
                  <thead>
                    <tr className='flex'>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[120px]'>PRICE</th>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[120px]'>EXPIRED ON</th>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[120px]'>FROM</th>
                      {/* <th className='pb-1 text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[120px]'>DIFF.</th> */}
                    </tr>
                  </thead>
                  <tbody className=''>
                    {bidsData.map((bid, index) => (
                      <tr className='flex' key={index}>
                        <td className='py-1 text-[12px] sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-white min-w-[120px]'>{formatPrice(ethers.utils.formatEther(String(bid.value)))} WBTTC</td>
                        <td className='text-[12px] sm:text-[10px] uppercase font-Kallisto font-normal text-black-400 dark:text-white min-w-[120px]'>{formatExpiration(bid.expireTimestamp)}</td>
                        <td className='text-[12px] sm:text-[10px] font-Kallisto font-normal text-black-400 dark:text-white uppercase min-w-[120px]'>{formatAddress(bid.bidder)}</td>
                        {/* <td className='text-[12px] sm:text-[10px] uppercase font-Kallisto font-normal text-black-400 dark:text-white min-w-[120px]'>ACCEPT OFFER</td> */}
                        <td className='min-w-[120px]'>
                          {isOwner && (
                            <button
                              onClick={() => handleSelectBid(bid)}
                              className='text-[12px] sm:text-[10px] uppercase font-Kallisto font-normal text-black-400 dark:text-white bg-transparent cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out'
                            >
                              ACCEPT OFFER
                            </button>
                          )}
                          {selectedBid && isOwner && (
                            <AcceptOffer
                              isOpen={isAcceptOfferOpen}
                              onClose={onAcceptOfferClose}
                              onAccepted={() => {
                                setTimeout(() => {
                                  nftStateUpdated().then(() => { })
                                }, 500)
                              }}
                              erc721Address={selectedBid.erc721Address}
                              tokenId={tokenId}
                              bidder={selectedBid.bidder}
                              value={selectedBid.value}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* <Activity /> */}
            <Card title="SALES">
              <div className="min-h-[50px] max-h-[200px] overflow-y-scroll sm:overflow-x-scroll">
                <table className='w-full'>
                  <thead>
                    <tr className='flex'>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px]'>TXID</th>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[80px]'>Price</th>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[120px]'>FROM</th>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[120px]'>TO</th>
                      <th className='text-[12px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px]'>Date</th>
                    </tr>
                  </thead>
                  <tbody className=''>
                    {salesData.map((sale, index) => (
                      <tr className='flex' key={index}>
                        <td className='py-1 text-[12px] sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-white min-w-[100px]'>
                          <a href={`https://bttcscan.com/tx/${sale.txid}`} target="_blank" rel="noopener noreferrer">View</a>
                        </td>
                        <td className='text-[12px] sm:text-[10px] uppercase font-Kallisto font-normal text-black-400 dark:text-white  min-w-[80px]'>{formatPrice(ethers.utils.formatEther(String(sale.price)))} BTT</td>
                        <td className='text-[12px] sm:text-[10px] uppercase font-Kallisto font-normal text-black-400 dark:text-white  min-w-[120px]'>{formatAddressSOLD(sale.seller)}</td>
                        <td className='text-[12px] sm:text-[10px] uppercase font-Kallisto font-normal text-black-400 dark:text-white  min-w-[120px]'>{formatAddressSOLD(sale.buyer)}</td>
                        <td className='text-[12px] sm:text-[10px] font-Kallisto font-normal text-black-400 dark:text-white uppercase  min-w-[100px]'>{formatDate(sale.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </div>
        {image && <Image image={image} setImage={setImage} alt={nftDetails.name || "NFT"} />}
      </div >
    </>
  )
}

export default NFTDetail


const Image = ({ image, setImage, alt }) => {
  return (
    <div className='fixed top-0 left-0 w-full h-screen bg-black-400/40 flex justify-center items-center z-[999999999]' onClick={() => setImage(null)}>
      <img className='rounded-lg h-[90%] sm:h-auto sm:w-[90%] object-contain' src={image} alt={alt} />
    </div>
  )
}