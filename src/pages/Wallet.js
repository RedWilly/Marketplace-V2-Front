import React, { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Assets from '../components/Assets'
import Listings from '../components/Listings'
import Bids from '../components/Bids'
import { GoCheckCircleFill } from 'react-icons/go'

import { ethers } from 'ethers';
// import ERC721ABI from '../abi/erc721.json';
import { useWallet } from '../hooks/useWallet';
import { useQuery } from '@apollo/client';
import { GET_LISTED_NFTS_FOR_ADDRESS, GET_BIDS_BY_ADDRESS, GET_ALL_NFTS_OWNED_BY_USER, GET_ALL_ACTIVE_BIDS } from '../graphql/Queries';
import Nft from "../utils/Nft";
import useDisclosure from '../hooks/useDisclosure';


import ListNFTModal from '../components/Market/ListNFTModal';
import CancelBidModal from '../components/Market/CancelBidModel';
import DeListNFTModal from '../components/Market/DeListNFTModal';
import AcceptOffer from '../components/Market/AcceptOffer';




function Wallet() {
    const [state, setState] = useState(0)
    const { account, library } = useWallet();
    //const [nfts, setNfts] = useState([1, 2, 3, 4, 5, 6, 7]) chnage
    const [nfts, setNfts] = useState([]);
    const [listings, setListings] = useState([]);
    const [bids, setBids] = useState([]);
    const [Offers, setOffers] = useState([]);

    const [activeListings, setActiveListings] = useState([]);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState({});
    const [isDeListModalOpen, setIsDeListModalOpen] = useState(false);
    const [isCancelBidModalOpen, setIsCancelBidModalOpen] = useState(false);
    const [selectedNFTForBidCancel, setSelectedNFTForBidCancel] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isAcceptOfferModalOpen, setIsAcceptOfferModalOpen] = useState(false);




    // Fetching Listed NFTs for the connected wallet
    const { data, loading, error } = useQuery(GET_LISTED_NFTS_FOR_ADDRESS, {
        variables: { seller: account?.toLowerCase() },
        skip: !account, // Skip this query if account is not available
    });

    // Fetching Active Bids for the connected wallet
    const { data: bidsData } = useQuery(GET_BIDS_BY_ADDRESS, {
        variables: { bidder: account?.toLowerCase() },
        skip: !account, // Skip this query if account is not available
    });

    // Use the useQuery hook to fetch NFTs owned by the user with skip option
    const { data: ownedNFTsData, loading: ownedNFTsLoading, error: ownedNFTsError } = useQuery(GET_ALL_NFTS_OWNED_BY_USER, {
        variables: { owner: account?.toLowerCase() },
        skip: !account, // Skip this query if account is not available
    });

    //get all active bids
    const { data: allbids } = useQuery(GET_ALL_ACTIVE_BIDS);

    //fetch nft for owned(assets)
    useEffect(() => {
        const fetchNFTMetadataAndImage = async () => {
            if (ownedNFTsData && !ownedNFTsLoading && !ownedNFTsError) {
                // Process each NFT
                const promises = ownedNFTsData.erc721S.map(async (nft) => {
                    const nftInstance = new Nft(168587773, nft.address, nft.tokenId);
                    try {
                        const metadata = await nftInstance.metadata();
                        const image = nftInstance.image();
                        // Assuming you need both the name from the metadata and the image URL
                        return {
                            name: metadata.name,
                            image,
                            tokenId: nft.tokenId,
                            contractAddress: nft.address
                        };
                    } catch (error) {
                        console.error('Error fetching NFT data:', error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                // Filter out any null results (failed fetches)
                setNfts(results.filter((nft) => nft !== null));
            }
        };

        fetchNFTMetadataAndImage();
    }, [ownedNFTsData, ownedNFTsLoading, ownedNFTsError]);

    //fetch listnft of the user
    useEffect(() => {
        const fetchListingMetadataAndImage = async () => {
            if (data && data.listings) {
                // Process each listed NFT
                const promises = data.listings.map(async (listing) => {
                    const nftInstance = new Nft(168587773, listing.erc721Address, listing.tokenId);
                    try {
                        const metadata = await nftInstance.metadata();
                        const image = nftInstance.image();
                        return {
                            contractAddress: listing.erc721Address,
                            tokenId: listing.tokenId,
                            price: listing.price,
                            expireTimestamp: listing.expireTimestamp,
                            name: metadata.name,
                            image
                        };
                    } catch (error) {
                        console.error('Error fetching listing data:', error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                // Filter out any null results (failed fetches)
                setListings(results.filter((listing) => listing !== null));
            }
        };

        fetchListingMetadataAndImage();
    }, [data]);

    //fetch nft bids by the user
    useEffect(() => {
        const fetchBidMetadataAndImage = async () => {
            if (bidsData && bidsData.bids) {
                const currentTimestamp = Math.floor(Date.now() / 1000);
                // Filter out expired bids
                const activeBids = bidsData.bids.filter(bid => parseInt(bid.expireTimestamp) > currentTimestamp);

                // Process each active bid
                const promises = activeBids.map(async (bid) => {
                    const nftInstance = new Nft(168587773, bid.erc721Address, bid.tokenId);
                    try {
                        const metadata = await nftInstance.metadata();
                        const image = nftInstance.image();
                        return {
                            ...bid,
                            price: bid.value, // bid amount by the user
                            expireTimestamp: bid.expireTimestamp,
                            name: metadata.name,
                            image: image,
                            contractAddress: bid.erc721Address,
                        };
                    } catch (error) {
                        console.error('Error fetching bid data:', error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                // Filter out any null results (failed fetches)
                setBids(results.filter(bid => bid !== null));
            }
        };

        fetchBidMetadataAndImage();
    }, [bidsData]);

    //for my bid section
    useEffect(() => {
        const fetchOffersForOwnedNFTs = async () => {
            // Check if we have the necessary data: owned NFTs and bids
            if (ownedNFTsData && !ownedNFTsLoading && !ownedNFTsError && allbids && allbids.bids) {
                const currentTimestamp = Math.floor(Date.now() / 1000);
                // Filter bids for those that are active and match an NFT the user owns
                const activesBids = allbids.bids.filter(bid => parseInt(bid.expireTimestamp) > currentTimestamp);

                const matchedBidsPromises = activesBids.map(async (bid) => {
                    const ownedNFT = ownedNFTsData.erc721S.find(nft => nft.tokenId === bid.tokenId && nft.address === bid.erc721Address);
                    if (ownedNFT) {
                        // The user owns the NFT for which there's an active bid
                        const nftInstance = new Nft(168587773, bid.erc721Address, bid.tokenId);
                        try {
                            const metadata = await nftInstance.metadata();
                            const image = nftInstance.image();
                            return {
                                ...bid,
                                price: bid.value, // bid amount by the user
                                expireTimestamp: bid.expireTimestamp,
                                name: metadata.name,
                                image: image,
                                contractAddress: bid.erc721Address,
                            };
                        } catch (error) {
                            console.error('Error fetching offer data:', error);
                            return null;
                        }
                    }
                    return null;
                });

                const matchedBids = await Promise.all(matchedBidsPromises);
                // Filter out any null results (failed fetches or unmatched bids)
                setOffers(matchedBids.filter(offer => offer !== null));
            }
        };

        fetchOffersForOwnedNFTs();
    }, [ownedNFTsData, ownedNFTsLoading, ownedNFTsError, allbids]);



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

    /* list, cancel, */
    const handleListForSaleClick = (nft) => {
        setSelectedNFT(nft);
        setIsListModalOpen(true);
    };

    const handleCancelListingClick = (nft) => {
        setSelectedNFT(nft);
        setIsDeListModalOpen(true);
    };

    const handleCancelBidClick = (bid) => {
        setSelectedNFTForBidCancel(bid);
        setIsCancelBidModalOpen(true);
    };

    const handleAcceptOfferClick = (offer) => {
        setSelectedOffer(offer); // Ensure this sets the correct offer object
        setIsAcceptOfferModalOpen(true);
    };


    return (
        <div className='py-20 flex justify-center items-start sm:px-7 sm:py-16'>
            <div className='w-[1257px] sm:w-full'>
                <h1 className='font-semibold font-Kallisto text-black-400 uppercase tracking-wider text-[48px] dark:text-white sm:text-2xl'>My Wallet</h1>

                <div className='flex gap-10 mt-8 breadcramps sm:gap-4 sm:mt-4'>
                    <p onClick={() => setState(0)} className={` ${state === 0 && 'active'} cursor-pointer text-black-400 font-Kallisto uppercase font-semibold text-sm tracking-widest dark:text-white sm:text-[12px]`}>Assets</p>
                    <p onClick={() => setState(1)} className={`${state === 1 && 'active'} cursor-pointer text-black-400 font-Kallisto uppercase font-semibold text-sm tracking-widest dark:text-white sm:text-[12px]`}>Listings</p>
                    <p onClick={() => setState(2)} className={`${state === 2 && 'active'} cursor-pointer text-black-400 font-Kallisto uppercase font-semibold text-sm tracking-widest dark:text-white sm:text-[12px]`}>My Bids</p>
                    <p onClick={() => setState(3)} className={`${state === 3 && 'active'} cursor-pointer text-black-400 font-Kallisto uppercase font-semibold text-sm tracking-widest dark:text-white sm:text-[12px]`}>Bid Received</p>

                </div>

                <div className='mt-6'>
                    {/* Assets */}
                    {state === 0 && <div className='flex justify-start items-stretch gap-9 flex-wrap sm:gap-3'>
                        {nfts.map((nft, index) => {
                            return <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                                <Link to={`/collection/${nft.contractAddress}/${nft.tokenId}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                                    <img src={nft.image} alt={nft.name} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                                </Link>
                                <div className='px-6 py-4 sm:px-3 sm:py-22'>
                                    <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{nft.name}
                                        <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                                    </h1>
                                    {/* <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 dark:text-white sm:text-sm'>$ {"250"}</p> */}
                                    {/* <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>Last Sale $ 80</p> */}
                                </div>
                                <ListNFTModal
                                    isOpen={isListModalOpen}
                                    onClose={() => setIsListModalOpen(false)}
                                    contractAddress={selectedNFT?.contractAddress}
                                    tokenId={selectedNFT?.tokenId}
                                />
                                <button onClick={() => handleListForSaleClick(nft)} className='bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'>
                                    <p className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider'>
                                        {"List For Sale"}
                                    </p>
                                </button>
                            </div>
                        })}
                    </div>}

                    {/* Listing NFTS */}
                    {state === 1 && <div className='flex justify-start items-stretch gap-9 flex-wrap sm:gap-3'>
                        {listings.map((listing, index) => {
                            return <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                                <Link to={`/collection/${listing.contractAddress}/${listing.tokenId}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                                    <img src={listing.image} alt={listing.name} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                                </Link>
                                <div className='px-6 py-4 sm:px-3 sm:py-22'>
                                    <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{listing.name}
                                        <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                                    </h1>
                                    <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 dark:text-white sm:text-sm'>
                                        <img src={require('../assets/logo/eth.png')} alt="ETH Logo" className='w-5 h-5 inline-block' />
                                        <span className='inline-block ml-1'>{ethers.utils.formatEther(listing.price)}</span>
                                    </p>
                                    <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>expires in {formatExpiration(listing.expireTimestamp)}</p>
                                </div>
                                <DeListNFTModal
                                    isOpen={isDeListModalOpen}
                                    onClose={() => setIsDeListModalOpen(false)}
                                    contractAddress={selectedNFT?.contractAddress}
                                    tokenId={selectedNFT?.tokenId}
                                />
                                <button onClick={() => handleCancelListingClick(listing)} className='bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'>
                                    <p className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider'>{"Cancel Listing"}</p>
                                </button>
                            </div>
                        })}
                    </div>}


                    {/* MY BIDS*/}
                    {state === 2 && <div className='flex justify-start items-stretch gap-9 flex-wrap sm:gap-3'>
                        {bids.map((bid, index) => {
                            return <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                                <Link to={`/collection/${bid.contractAddress}/${bid.tokenId}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                                    <img src={bid.image} alt={bid.name} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                                </Link>
                                <div className='px-6 py-4 sm:px-3 sm:py-22'>
                                    <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{bid.name}
                                        {/* <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' /> */}
                                    </h1>
                                    <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 dark:text-white sm:text-sm'>
                                        <img src={require('../assets/logo/eth.png')} alt="ETH Logo" className='w-5 h-5 inline-block' />
                                        <span className='inline-block ml-1'>{ethers.utils.formatEther(bid.value)}</span>
                                    </p>
                                    <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>expires in {formatExpiration(bid.expireTimestamp)}</p>
                                </div>
                                <CancelBidModal
                                    isOpen={isCancelBidModalOpen}
                                    onClose={() => setIsCancelBidModalOpen(false)}
                                    bid={selectedNFTForBidCancel}
                                    contractAddress={selectedNFTForBidCancel?.contractAddress}
                                    tokenId={selectedNFTForBidCancel?.tokenId}
                                />

                                <button onClick={() => handleCancelBidClick(bid)} className='bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'>
                                    <p className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider'>{"cancel bid"}</p>
                                </button>
                            </div>
                        })}
                    </div>}

                    {/* BID RECEIVED */}
                    {state === 3 && <div className='flex justify-start items-stretch gap-9 flex-wrap sm:gap-3'>
                        {Offers.map((offer, index) => {
                            return <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                                <Link to={`/collection/${offer.contractAddress}/${offer.tokenId}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                                    <img src={offer.image} alt={offer.name} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                                </Link>
                                <div className='px-6 py-4 sm:px-3 sm:py-22'>
                                    <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{offer.name}
                                        {/* <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' /> */}
                                    </h1>
                                    <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 dark:text-white sm:text-sm'>
                                        <img src={require('../assets/logo/eth.png')} alt="ETH Logo" className='w-5 h-5 inline-block' />
                                        <span className='inline-block ml-1'>{ethers.utils.formatEther(offer.value)}</span>
                                    </p>
                                    <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>expires in {formatExpiration(offer.expireTimestamp)}</p>
                                </div>
                                <AcceptOffer
                                    isOpen={isAcceptOfferModalOpen}
                                    onClose={() => setIsAcceptOfferModalOpen(false)}
                                    offer={selectedOffer}
                                    erc721Address={selectedOffer?.contractAddress}
                                    tokenId={selectedOffer?.tokenId}
                                    value={selectedOffer?.value}
                                    bidder={selectedOffer?.bidder}
                                />
                                <button onClick={() => handleAcceptOfferClick(offer)} className='bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'>
                                    <p className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider'>{"Accept bid"}</p>
                                </button>
                            </div>
                        })}
                    </div>}

                </div>
            </div>
        </div>
    )
}

export default Wallet
