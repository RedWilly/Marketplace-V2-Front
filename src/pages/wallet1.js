import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ERC721ABI from '../abi/erc721.json';
import { useWallet } from '../hooks/useWallet';
import { useQuery } from '@apollo/client';
import { GET_LISTED_NFTS_FOR_ADDRESS, GET_BIDS_BY_ADDRESS } from '../graphql/Queries';
import client from '../graphql/apollo-client';
import ListNFTModal from '../components/ListNFTModal';
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Input,
    useDisclosure,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
    Image,
} from '@chakra-ui/react';

const Wallet = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [contractAddress, setContractAddress] = useState('');
    const [nfts, setNfts] = useState([]);
    const { account, library } = useWallet();
    const [bids, setBids] = useState([]);
    const [listings, setListings] = useState([]);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState({});


    const { data, loading, error } = useQuery(GET_LISTED_NFTS_FOR_ADDRESS, {
        variables: { seller: account?.toLowerCase() },
        client: client,
    });

    //Fetching Active Bids for the Connected wallets
    const { data: bidsData } = useQuery(GET_BIDS_BY_ADDRESS, {
        variables: { bidder: account?.toLowerCase() },
        client: client,
    });
    useEffect(() => {
        console.log("GraphQL Query Data:", data);
        console.log("GraphQL Query Loading:", loading);
        console.log("GraphQL Query Error:", error);
    }, [data, loading, error]);

    const fetchNFTMetadata = async (tokenURI) => {
        try {
            const response = await fetch(tokenURI);
            if (!response.ok) throw new Error(`Failed to fetch metadata: ${response.statusText}`);
            const metadata = await response.json();
            return metadata;
        } catch (error) {
            console.error("Error fetching NFT metadata:", error);
            return null;
        }
    };

    useEffect(() => {
        const savedAddress = localStorage.getItem('contractAddress');
        if (savedAddress) {
            setContractAddress(savedAddress);
        }
    }, []); // This effect runs once on mount

    useEffect(() => {
        if (data && data.listings) {
            const fetchAllMetadata = async () => {
                const listingsWithMetadata = await Promise.all(data.listings.map(async (listing) => {
                    const contract = new ethers.Contract(listing.erc721Address, ERC721ABI, library.getSigner());
                    const tokenURI = await contract.tokenURI(listing.tokenId);
                    const metadata = await fetchNFTMetadata(tokenURI);
                    console.log("Fetched NFT Metadata:", metadata);
                    return { ...listing, metadata };
                }));
                console.log("Listings with Metadata:", listingsWithMetadata);
                setListings(listingsWithMetadata);
            };

            fetchAllMetadata();
        }
    }, [data, library]);

    //Display Each Bid in the Bids Tab Panel -subgraph
    useEffect(() => {
        if (bidsData && bidsData.bids) {
            const fetchBidsMetadata = async () => {
                const bidsWithMetadata = await Promise.all(bidsData.bids.map(async (bid) => {
                    const contract = new ethers.Contract(bid.erc721Address, ERC721ABI, library.getSigner());
                    const tokenURI = await contract.tokenURI(bid.tokenId);
                    const metadata = await fetchNFTMetadata(tokenURI);
                    return { ...bid, metadata };
                }));
                setBids(bidsWithMetadata);
            };

            fetchBidsMetadata();
        }
    }, [bidsData, library]);

    useEffect(() => {
        if (account && library && contractAddress) {
            const fetchNFTs = async () => {
                const contract = new ethers.Contract(contractAddress, ERC721ABI, library.getSigner());
                const balance = await contract.balanceOf(account);
                const fetchedNfts = [];
                for (let i = 0; i < balance.toNumber(); i++) {
                    const tokenId = await contract.tokenOfOwnerByIndex(account, i);
                    const tokenURI = await contract.tokenURI(tokenId);
                    const metadata = await fetchNFTMetadata(tokenURI);
                    if (metadata) {
                        fetchedNfts.push({
                            metadata,
                            tokenId: tokenId.toString(),
                            contractAddress // Assuming contractAddress is a string
                        });
                    }
                }

                // Filter out listed NFTs
                const unlistedNfts = fetchedNfts.filter(nft =>
                    !listings.some(listing =>
                        listing.tokenId === nft.tokenId && listing.erc721Address.toLowerCase() === nft.contractAddress.toLowerCase()
                    )
                );

                setNfts(unlistedNfts); // Keep the entire NFT object, including tokenId and contractAddress
            };

            fetchNFTs();
        }
    }, [account, library, contractAddress, listings]);



    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    // Handler for opening the listing modal with selected NFT details
    const openListModal = (nft) => {
        console.log("Opening modal for NFT with:", nft);
        setSelectedNFT(nft); // Now nft includes metadata, tokenId, and contractAddress
        setIsListModalOpen(true);
    };


    const NFTCard = ({ nft, price, isListing, isBid }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                position="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Image src={nft.metadata?.image || nft?.image} alt={nft.metadata?.name || nft?.name} />
                <Box p="6">
                    <Text fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                        {nft.metadata?.name || nft?.name}
                    </Text>
                    {price && <Text>Price: {ethers.utils.formatEther(price)} ETH</Text>}
                    {isHovered && (
                        <Button
                            size="sm"
                            colorScheme={isListing ? "red" : isBid ? "orange" : "teal"}
                            position="absolute"
                            bottom="5"
                            left="50%"
                            transform="translateX(-50%)"
                            transition="opacity 0.2s"
                        >
                            {isListing ? "Cancel Listing" : isBid ? "Cancel Bid" : "List for Sale"}
                        </Button>
                    )}
                </Box>
                {!isListing && (
                    <Button onClick={() => openListModal(nft)}>List for Sale</Button>
                )}
            </Box>
        );
    };

    return (
        <Box p={5}>
            <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                    <Tab>Assets</Tab>
                    <Tab>Listings</Tab>
                    <Tab>Offered</Tab>
                    <Tab>Bids</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Button onClick={onOpen}>Import Collection</Button>
                        <Modal isOpen={isOpen} onClose={onClose}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Import Collection Address</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody pb={6}>
                                    <Input placeholder="Contract Address" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
                                    <Button mt={4} onClick={() => {
                                        localStorage.setItem('contractAddress', contractAddress);
                                        onClose();
                                    }}>Import</Button>
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                            {nfts.map((nft, index) => (
                                <NFTCard key={index} nft={nft} />
                            ))}
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                            {listings.map((listing, index) => (
                                <NFTCard key={index} nft={listing.metadata} price={listing.price} isListing={true} />
                            ))}
                            <ListNFTModal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} contractAddress={selectedNFT.contractAddress} tokenId={selectedNFT.tokenId} />
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Text>Offered content goes here...</Text>
                    </TabPanel>
                    <TabPanel>
                        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                            {bids.map((bid, index) => (
                                <NFTCard key={index} nft={bid.metadata} price={bid.value} isBid={true} />
                            ))}
                        </Box>
                    </TabPanel>

                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default Wallet;