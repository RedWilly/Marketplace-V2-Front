import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { GoCheckCircleFill } from 'react-icons/go'

import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';

import Nft from "../utils/Nft";
import whitelist from '../components/whitelist';
import MarketplaceApi from "../utils/MarketplaceApi"; //middleware api for getting nft details and collection stats
import ERC721ABI from '../abi/erc721.json';

import ListNFTModal from '../components/Market/ListNFTModal';
import CancelBidModal from '../components/Market/CancelBidModel';
import DeListNFTModal from '../components/Market/DeListNFTModal';
import AcceptOffer from '../components/Market/AcceptOffer';

function Wallet() {
    const [state, setState] = useState(0)
    const { account } = useWallet();
    //const [nfts, setNfts] = useState([1, 2, 3, 4, 5, 6, 7]) chnage
    const [unfilteredNfts, setUnfilteredNfts] = useState([]); // store all owned NFTs
    const [nfts, setNfts] = useState([]); //store all owned nft filtered against listed 
    const [listings, setListings] = useState([]);
    const [bids, setBids] = useState([]);
    const [Offers, setOffers] = useState([]);

    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState({});
    const [isDeListModalOpen, setIsDeListModalOpen] = useState(false);
    const [isCancelBidModalOpen, setIsCancelBidModalOpen] = useState(false);
    const [selectedNFTForBidCancel, setSelectedNFTForBidCancel] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isAcceptOfferModalOpen, setIsAcceptOfferModalOpen] = useState(false);

    const [bttToUsdPrice, setBttToUsdPrice] = useState(null);


    // //fetch nft for owned(assets) and listing ( exclude listed nft from assets page)

    async function fetchData() {
        if (!account) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        let allNfts = [];
        let listedTokenIds = new Set(); // Use a Set to store listed token IDs for quick lookup

        // Fetch listings by seller address
        try {
            const fetchedListings = await MarketplaceApi.fetchListingsBySeller(account);
            const listingPromises = fetchedListings.map(async (listing) => {
                const nftInstance = new Nft(199, listing.erc721Address, listing.tokenId);
                try {
                    const metadata = await nftInstance.metadata();
                    const image = nftInstance.image();
                    listedTokenIds.add(listing.tokenId + listing.erc721Address); // Add to set for quick reference
                    return {
                        ...listing,
                        name: metadata.name,
                        image: image
                    };
                } catch (error) {
                    console.error('Error fetching listing data for token ID:', listing.tokenId, error);
                    return null;
                }
            });

            const listedNfts = (await Promise.all(listingPromises)).filter(nft => nft !== null);
            setListings(listedNfts);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }

        // Fetch NFTs owned by the user across all whitelisted collections
        for (let key of Object.keys(whitelist)) {
            const collection = whitelist[key];
            const contract = new ethers.Contract(collection.address, ERC721ABI, provider);

            try {
                const balance = await contract.balanceOf(account);
                if (balance.isZero()) continue;

                for (let i = 0; i < balance.toNumber(); i++) {
                    const tokenId = await contract.tokenOfOwnerByIndex(account, i);
                    const uniqueTokenId = tokenId.toString() + collection.address;

                    const nftInstance = new Nft(199, collection.address, tokenId.toString());
                    const metadata = await nftInstance.metadata();
                    const image = nftInstance.image();

                    let nftData = {
                        name: metadata.name,
                        image: image,
                        tokenId: tokenId.toString(),
                        contractAddress: collection.address
                    };

                    allNfts.push(nftData);
                    if (!listedTokenIds.has(uniqueTokenId)) {
                        // Only add to assets if not listed
                        nfts.push(nftData);
                    }
                }
            } catch (error) {
                console.error(`Error fetching NFTs from ${collection.address}:`, error);
            }
        }

        setNfts(nfts); // Set filtered NFTs to display in Assets
        setUnfilteredNfts(allNfts); // Set all fetched NFTs whether listed or not
    }

    useEffect(() => {

        fetchData();
    }, [account]);


    const fetchBids = async () => {
        if (!account) return;

        try {
            const fetchedBids = await MarketplaceApi.fetchBidsByBidder(account);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            // Filter out expired bids
            const activeBids = fetchedBids.filter(bid => parseInt(bid.expireTimestamp) > currentTimestamp);

            // Process each active bid
            const promises = activeBids.map(async (bid) => {
                const nftInstance = new Nft(199, bid.erc721Address, bid.tokenId);
                try {
                    const metadata = await nftInstance.metadata();
                    const image = nftInstance.image();
                    return {
                        ...bid,
                        price: bid.value,
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
        } catch (error) {
            console.error('Error fetching bids:', error);
        }
    };
    useEffect(() => {

        fetchBids();
    }, [account]);

    //for my bid section
    const fetchOffers = async () => {
        if (!account || unfilteredNfts.length === 0) return;

        try {
            // Fetch all active bids from the marketplace
            const allBids = await MarketplaceApi.fetchActiveBids();
            const currentTimestamp = Math.floor(Date.now() / 1000);

            // Filter and process bids that match owned NFTs
            const matchedBidsPromises = allBids.filter(bid => parseInt(bid.expireTimestamp) > currentTimestamp)
                .filter(bid => unfilteredNfts.some(nft => nft.tokenId === bid.tokenId && nft.contractAddress === bid.erc721Address))
                .map(async (bid) => {
                    const nftInstance = new Nft(199, bid.erc721Address, bid.tokenId);
                    try {
                        const metadata = await nftInstance.metadata();
                        const image = nftInstance.image();
                        return {
                            ...bid,
                            price: bid.value,
                            name: metadata.name,
                            image,
                            contractAddress: bid.erc721Address,
                        };
                    } catch (error) {
                        console.error('Error fetching bid data:', error);
                        return null;
                    }
                });

            const matchedBids = await Promise.all(matchedBidsPromises);
            console.log("Matched Bids Set for Offers:", matchedBids.filter(offer => offer !== null)); // Log the matched bids
            setOffers(matchedBids.filter(offer => offer !== null));
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    useEffect(() => {

        fetchOffers();
    }, [account, unfilteredNfts]);


    // fetch price
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


    //format price
    const formatPriceWithUSD = (bttAmount) => {
        const num = parseFloat(ethers.utils.formatEther(bttAmount));
        const formattedBTT = formatPrice(num);

        const priceInUSD = bttToUsdPrice ? (
            <span style={{ fontSize: 'small', fontWeight: 'normal', color: '#6b7280' /* gray-500 */ }}>
                (${(num * bttToUsdPrice).toFixed(3)})
            </span>
        ) : (
            <span style={{ fontSize: 'small', fontWeight: 'normal', color: '#6b7280' }}>
                (USD not available)
            </span>
        );

        return (
            <span>{formattedBTT} {priceInUSD}</span>
        );
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
                                    onClose={() => {
                                        setIsListModalOpen(false)
                                        fetchData().then(() => { })
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
                                        <img src={require('../assets/logo/bttc.png')} alt="BTTC Logo" className='w-5 h-5 inline-block' />
                                        <span className='inline-block ml-1'>
                                            {/* {formatPrice(listing.price)} BTTC */}
                                            {formatPriceWithUSD(listing.price)}
                                            {/* {ethers.utils.formatEther(listing.price)} */}
                                        </span>
                                    </p>
                                    <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>expires in {formatExpiration(listing.expireTimestamp)}</p>
                                </div>
                                <DeListNFTModal
                                    isOpen={isDeListModalOpen}
                                    onClose={() => {
                                        setIsDeListModalOpen(false)
                                        fetchData().then(() => { })
                                    }}
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
                                        <img src={require('../assets/logo/bttc.png')} alt="BTTC Logo" className='w-5 h-5 inline-block' />
                                        <span className='inline-block ml-1'>
                                            {formatPriceWithUSD(bid.value)}
                                            {/* {ethers.utils.formatEther(bid.value)} */}
                                        </span>
                                    </p>
                                    <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>expires in {formatExpiration(bid.expireTimestamp)}</p>
                                </div>
                                <CancelBidModal
                                    isOpen={isCancelBidModalOpen}
                                    onClose={() => {
                                        setIsCancelBidModalOpen(false)
                                        fetchBids().then(() => { })
                                    }}
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
                                        <img src={require('../assets/logo/bttc.png')} alt="BTTC Logo" className='w-5 h-5 inline-block' />
                                        <span className='inline-block ml-1'>
                                            {formatPriceWithUSD(offer.value)}
                                            {/* {ethers.utils.formatEther(offer.value)} */}
                                        </span>
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
                                    onAccepted={() => {
                                        fetchBids().then(() => { })
                                    }}
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
