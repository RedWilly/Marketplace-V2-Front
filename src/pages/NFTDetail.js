import React, { useState, useEffect } from 'react';
import { GoCheckCircleFill } from 'react-icons/go'
import { Link, useParams } from 'react-router-dom'
import { FiRefreshCcw } from "react-icons/fi";
import { CiFlag1, CiShare2 } from 'react-icons/ci';
import { PiTriangleLight } from "react-icons/pi";
import Card from '../components/Card';
import { BsArrowsAngleExpand } from "react-icons/bs";
import useDisclosure from '../hooks/useDisclosure';

// web3 - subgraph
import Nft from "../utils/Nft";
import { ethers } from 'ethers';
import { useQuery } from '@apollo/client';
import { useWallet } from '../hooks/useWallet';
import { GET_ACTIVE_LISTING_BY_NFT, GET_ACTIVE_BIDS_FOR_NFT, GET_ALL_SOLD_FOR_NFT } from '../graphql/Queries';
//marketplace
import BuyNow from '../components/Market/BuyNow';
import MakeOffer from '../components/Market/MakeOffer';
import AcceptOffer from '../components/Market/AcceptOffer';
import DeListNFTModal from '../components/Market/DeListNFTModal';
import ListNFTModal from '../components/Market/ListNFTModal';





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



  //subgraph and data fetching
  const { data, loading: isListingLoading } = useQuery(GET_ACTIVE_LISTING_BY_NFT, {
    variables: { erc721Address: contractAddress, tokenId },
  });

  const { data: bidsData } = useQuery(GET_ACTIVE_BIDS_FOR_NFT, {
    variables: { erc721Address: contractAddress, tokenId },
  });

  const { data: salesData } = useQuery(GET_ALL_SOLD_FOR_NFT, {
    variables: { erc721Address: contractAddress, tokenId },
  });


  // Utility function to format the timestamp
  const formatDate = (timestamp) => {
    const now = new Date();
    const eventDate = new Date(timestamp * 1000);
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

  useEffect(() => {
    if (data && data.listings && data.listings.length > 0) {
      setIsListed(true);
      setIsSeller(account && data.listings[0].seller.toLowerCase() === account.toLowerCase());
    } else {
      setIsListed(false);
      setIsSeller(false); // Ensure isSeller is reset if there's no listing
    }
  }, [data, account]);


  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!contractAddress || !tokenId) return;

      try {
        const nft = new Nft(168587773, contractAddress, tokenId);
        const metadata = await nft.metadata();

        const price = isListed && data.listings[0] ? ethers.utils.formatUnits(data.listings[0].price, 'ether') : null;

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
        console.log(nft.image())
      } catch (error) {
        console.error("Failed to fetch NFT details", error);
      }
    };

    fetchNFTDetails();
  }, [contractAddress, tokenId, data, isListed, active, account]);


  return (
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
          <GoCheckCircleFill className='text-blue-200 text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
        </Link>

        <div className='flex justify-between items-center relative'>
          <h1 className='text-black-400 font-Kallisto text-2xl font-semibold dark:text-white uppercase sm:text-base'>{nftDetails.name}</h1>
          <div className='flex justify-end items-center gap-3 sm:absolute sm:right-0 -top-7 sm:gap-1'>
            <FiRefreshCcw className='cursor-pointer text-lg sm:text-sm text-black-50 dark:text-grey-100' />
            <CiShare2 className='cursor-pointer text-2xl sm:text-lg text-black-50 dark:text-grey-100' />
            <CiFlag1 className='cursor-pointer text-2xl  sm:text-lg text-black-50 dark:text-grey-100' />
            <PiTriangleLight className='cursor-pointer text-2xl  sm:text-lg text-black-50 dark:text-grey-100' />
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
              <h1 className='text-black-400 font-Kallisto text-base font-medium dark:text-white uppercase sm:text-[12px]'>
                {nftDetails.price} ETH
              </h1>
            )}
          </div>
          {active && nftDetails.price && isListed && !isSeller && (
            <BuyNow
              erc721Address={contractAddress}
              tokenId={tokenId}
              price={ethers.utils.parseUnits(nftDetails.price, 'ether')}
              className='mt-3 sm:mt-1 sm:text-[10px] bg-black px-11 py-[10px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[12px] uppercase font-Kallisto font-medium tracking-widest text-white cursor-pointer outline-none hover:text-black-400 hover:bg-grey-100/20 hover:text-black transition-all ease-linear duration-150 dark:hover:text-white dark:hover:bg-grey-100'
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
            onClose={() => setIsCancelBidModalOpen(false)}
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
            onClose={() => setIsListModalOpen(false)}
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
                <p className='text-[12px] text-black-400 cursor-pointer font-semibold dark:text-white font-Kallisto underline hover:no-underline'>{tokenId}</p>
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
                  {bidsData?.bids.map((bid, index) => (
                    <tr className='flex' key={index}>
                      <td className='py-1 text-[12px] sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-white min-w-[120px]'>{ethers.utils.formatEther(bid.value)} ETH</td>
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
                  {salesData?.sales.map((sale, index) => (
                    <tr className='flex' key={index}>
                      <td className='py-1 text-[12px] sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-white min-w-[100px]'>
                        <a href={`https://sepolia.blastscan.io/tx/${sale.id.split('-')[0]}`} target="_blank" rel="noopener noreferrer">View</a>
                      </td>
                      <td className='text-[12px] sm:text-[10px] uppercase font-Kallisto font-normal text-black-400 dark:text-white  min-w-[80px]'>{ethers.utils.formatEther(sale.price)} ETH</td>
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