import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Text,
    Image,
    VStack,
    Grid,
    Button,
    useDisclosure,
    Collapse,
    Link as ChakraLink,
    GridItem
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useQuery } from '@apollo/client';
import { useWallet } from '../hooks/useWallet';
import { GET_ACTIVE_LISTING_BY_NFT, GET_ACTIVE_BIDS_FOR_NFT, GET_ALL_SOLD_FOR_NFT } from '../graphql/Queries';
import BuyNow from '../components/Market/BuyNow';
import MakeOffer from '../components/Market/MakeOffer';
import AcceptOffer from '../components/Market/AcceptOffer';
import Nft from "../util/Nft";


const NFTDetail = () => {
    let { contractAddress, tokenId } = useParams();
    contractAddress = contractAddress.toLowerCase();
    const { active, account } = useWallet();
    const [nftDetails, setNftDetails] = useState({});
    const [isListed, setIsListed] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const { isOpen: isOfferOpen, onOpen: onOfferOpen, onClose: onOfferClose } = useDisclosure();
    const { isOpen: isBidsOpen, onToggle: onBidsToggle } = useDisclosure();
    const [selectedBid, setSelectedBid] = useState(null);
    const { isOpen: isAcceptOfferOpen, onOpen: onAcceptOfferOpen, onClose: onAcceptOfferClose } = useDisclosure();
    const { isOpen: isSalesOpen, onToggle: onSalesToggle } = useDisclosure();

    const { data } = useQuery(GET_ACTIVE_LISTING_BY_NFT, {
        variables: { erc721Address: contractAddress, tokenId },
    });

    const { data: bidsData } = useQuery(GET_ACTIVE_BIDS_FOR_NFT, {
        variables: { erc721Address: contractAddress, tokenId },
    });

    // Use the GET_ALL_SOLD_FOR_NFT query
    const { data: salesData } = useQuery(GET_ALL_SOLD_FOR_NFT, {
        variables: { erc721Address: contractAddress, tokenId },
    });

    // Utility function to format the timestamp
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
    };

    const handleSelectBid = (bid) => {
        setSelectedBid(bid);
        onAcceptOfferOpen();
    };

    // Utility function to format addresses
    const formatAddress = (address) => `${address.slice(0, 5)}...${address.slice(-3)}`;

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
            setIsSeller(data.listings[0].seller.toLowerCase() === account.toLowerCase());
        } else {
            setIsListed(false);
            setIsSeller(false); // Ensure isSeller is reset if there's no listing
        }

        if(nftDetails && nftDetails.owner) {
            if(nftDetails.owner.toLowerCase() === account.toLowerCase()) {
                setIsOwner(true)
            } else {
                setIsOwner(false)
            }
        }

    }, [data, account, nftDetails]);

    useEffect(() => {
        const fetchNFTDetails = async () => {
            if (!contractAddress || !tokenId) return;

            // Now safe to use contractAddress and tokenId
            contractAddress = contractAddress.toLowerCase();
            try {
                const nft = new Nft(168587773, contractAddress, tokenId);
                const metadata = await nft.metadata();

                //price based on whether the NFT is listed
                const price = isListed && data.listings[0].price ? ethers.utils.formatUnits(data.listings[0].price, 'ether') : null;

                setNftDetails({
                    ...metadata,
                    owner: await nft.owner(),
                    image: nft.image(),
                    price,
                });
                console.log(nft.image())
            } catch (error) {
                console.error("Failed to fetch NFT details from middleware", error);
            }
        };

        fetchNFTDetails();
    }, [contractAddress, tokenId, data, isListed]);

    return (
        <VStack spacing={4} p={10} align="stretch">
            <Box>
                <Grid spacing={8} templateAreas={`"nft traits"`} gridTemplateColumns={'400px 1fr'}>
                    <GridItem p={4}>
                        <Image src={nftDetails.image} alt={nftDetails.name} borderRadius='5px' objectFit="cover" />
                        <Text fontSize="2xl" fontWeight="bold">{nftDetails.name}</Text>
                        { nftDetails && nftDetails.owner != null ? <Text fontSize="sm">
                            Owned by: {nftDetails.owner.substring(0,6)}...{nftDetails.owner.substring(38)}
                        </Text> : ''}
                        <Text fontSize="lg">{nftDetails.description}</Text>

                        {/* Show Buy Now button only if NFT is listed and user is not the seller */}
                        {active && nftDetails.price && isListed && !isSeller && (
                            <BuyNow erc721Address={contractAddress} tokenId={tokenId} price={ethers.utils.parseUnits(nftDetails.price, 'ether')} />
                        )}
                        {/* Show Make Offer button if NFT is not listed or user is not the seller */}
                        {(active && !isOwner && (!isListed || !isSeller)) && (
                            <Button colorScheme="blue" mt="4" onClick={onOfferOpen}>
                                Make Offer
                            </Button>
                        )}

                        <MakeOffer isOpen={isOfferOpen} onClose={onOfferClose} erc721Address={contractAddress} tokenId={tokenId} />
                    </GridItem>
                    <GridItem p={4}>
                        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                            {nftDetails.attributes?.map((attr, index) => (
                                <Box key={index} p="5" shadow="md" borderWidth="1px">
                                    <Text fontWeight="bold">{attr.trait_type}</Text>
                                    <Text>{attr.value}</Text>
                                </Box>
                            ))}
                        </Grid>
                    </GridItem>
                </Grid>
            </Box>

            {/* Existing elements */}
            <VStack align={'stretch'}>
                <Button onClick={onBidsToggle}>{isBidsOpen ? 'Hide Offers/Bids' : 'Show Offers/Bids'} ({bidsData ? bidsData?.bids.length : ''})</Button>
                <Collapse in={isBidsOpen} animateOpacity>
                    <VStack spacing={4}>
                        {bidsData?.bids.map((bid, index) => (
                            <Box key={index} p={4} shadow="md" borderWidth="1px">
                                <Text>Price: {ethers.utils.formatEther(bid.value)} ETH</Text>
                                <Text>Expires: {formatExpiration(bid.expireTimestamp)}</Text>
                                <Text>Bidder: {formatAddress(bid.bidder)}</Text>
                                {isSeller && (
                                    <Button size="sm" colorScheme="blue" onClick={() => handleSelectBid(bid)}>
                                        Accept Offer
                                    </Button>
                                )}
                            </Box>
                        ))}
                    </VStack>
                </Collapse>
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

                {/* Sales History Section */}
                <Button onClick={onSalesToggle}>{isSalesOpen ? 'Hide History/Sales' : 'Show History/Sales '} ({salesData ? salesData.sales.length : ''})</Button>
                <Collapse in={isSalesOpen} animateOpacity>
                    {salesData && salesData.sales.length > 0 ? (
                        <VStack spacing={4} align={'stretch'}>
                            {salesData.sales.map((sale, index) => (
                                <Box key={index} p={4} shadow="md" borderWidth="1px">
                                    <Text fontWeight={'bold'}>Price: {ethers.utils.formatEther(sale.price)} ETH</Text>
                                    <Text>Seller: {formatAddress(sale.seller)}</Text>
                                    <Text>Buyer: {formatAddress(sale.buyer)}</Text>
                                    <Text>Sold on: {formatDate(sale.timestamp)}</Text>
                                    <ChakraLink href={`https://testnet.blastscan.io/tx/${sale.id.split('-')[0]}`} isExternal>
                                        View Transaction
                                    </ChakraLink>
                                </Box>
                            ))}
                        </VStack>
                    ) : (
                        <Text>No sales</Text>
                    )}
                </Collapse>
            </VStack>
        </VStack>

    );
};

export default NFTDetail;
