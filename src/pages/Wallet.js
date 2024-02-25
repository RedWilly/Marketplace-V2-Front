import { useNavigate } from 'react-router-dom'; // Step 1
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ERC721ABI from '../abi/erc721.json';
import { useWallet } from '../hooks/useWallet';
import { useQuery } from '@apollo/client';
import { GET_LISTED_NFTS_FOR_ADDRESS, GET_BIDS_BY_ADDRESS } from '../graphql/Queries';
import client from '../graphql/apollo-client';
import ListNFTModal from '../components/Market/ListNFTModal';
import DeListNFTModal from '../components/Market/DeListNFTModal';
import CancelBidModal from '../components/Market/CancelBidModel';
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
import Nft from "../util/Nft";
import whitelist from "../components/Whitelist";

const Wallet = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [contractAddresses, setContractAddresses] = useState([]);
  const [nfts, setNfts] = useState([]);
  const { account, library, defaultProvider } = useWallet();
  const [bids, setBids] = useState([]);
  const [listings, setListings] = useState([]);
  //list,cancel list, cancel bid
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState({});
  const [isDeListModalOpen, setIsDeListModalOpen] = useState(false);
  const [selectedNFTForDelist, setSelectedNFTForDelist] = useState(null);
  const [isCancelBidModalOpen, setIsCancelBidModalOpen] = useState(false);
  const [selectedNFTForBidCancel, setSelectedNFTForBidCancel] = useState(null);

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

  useEffect(() => {
    const savedAddress = localStorage.getItem('contractAddresses');
    let collections = [];
    for(let i in savedAddress) {
      collections.push(savedAddress[i]);
    }
    for(let j in whitelist) {
      if(!collections.includes(whitelist[j])) {
        collections.push(whitelist[j])
      }
    }

    console.log(collections)

    if (collections.length > 0) {
      setContractAddresses(collections);
    }
  }, []); // This effect runs once on mount

  useEffect(() => {
    if (data && data.listings) {
      const fetchAllMetadata = async () => {
        const listingsWithMetadata = await Promise.all(data.listings.map(async (listing) => {
          const nft = new Nft(168587773, listing.erc721Address, listing.tokenId)
          const metadata = await nft.metadata();
          metadata.image = nft.image()
          return {
            ...listing,
            metadata,
            contractAddress: listing.erc721Address, // Ensure correct property names
            tokenId: listing.tokenId.toString(),
          };
        }));

        // Set your state with the adjusted listings
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
          const nft = new Nft(168587773, bid.erc721Address, bid.tokenId)
          const metadata = await nft.metadata();
          metadata.image = nft.image()
          return {
            ...bid,
            metadata,
            contractAddress: bid.erc721Address, // Ensure this is the correct property from your bids data
            tokenId: bid.tokenId.toString(), // Convert tokenId to string if necessary
          };
        }));
        setBids(bidsWithMetadata);
      };

      fetchBidsMetadata();
    }
  }, [bidsData, library]);


  useEffect(() => {
    if (account && library && contractAddresses) {
      const fetchNFTs = async () => {
        let provider = library.getSigner();
        if(!provider) provider = await defaultProvider()

        const fetchedNfts = [];
        for(let i in contractAddresses) {
          const contractAddress = contractAddresses[i]
          const contract = new ethers.Contract(contractAddress, ERC721ABI, provider);
          const balance = await contract.balanceOf(account);
          for (let i = 0; i < balance.toNumber(); i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(account, i);

            const nft = new Nft(168587773, contractAddress, tokenId)
            const metadata = await nft.metadata();
            metadata.image = nft.image()
            if (metadata) {
              fetchedNfts.push({
                metadata,
                tokenId: tokenId.toString(),
                contractAddress // contractAddress
              });
            }
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
  }, [account, library, contractAddresses, listings]);



  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  // Handler for opening the listing modal with selected NFT details
  const openListModal = (nft) => {
    console.log("Opening modal for NFT with:", nft);
    setSelectedNFT(nft); // Now nft includes metadata, tokenId, and contractAddress
    setIsListModalOpen(true);
  };

  // Handler for opening the DeListNFTModal with the selected NFT
  const openDeListModal = (nft) => {
    setSelectedNFTForDelist(nft);
    setIsDeListModalOpen(true);
  };

  // Handler for opening the DeListNFTModal with the selected NFT
  const openCancelBidModal = (nft) => {
    setSelectedNFTForBidCancel(nft);
    setIsCancelBidModalOpen(true);
  };


  const NFTCard = ({ nft, price, isListing, isBid }) => {
    const navigate = useNavigate(); // Step 2

    const navigateToNFTDetail = () => {
      navigate(`/collection/${nft.contractAddress}/${nft.tokenId}`);
    };

    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        position="relative"
        cursor="pointer"
        onClick={navigateToNFTDetail} // Step 3
      >
        <Image src={nft.metadata?.image || nft?.image} alt={nft.metadata?.name || nft?.name} />
        <Box p="6">
          <Text fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
            {nft.metadata?.name || nft?.name}
          </Text>
          {price && <Text>Price: {ethers.utils.formatEther(price)} ETH</Text>}
          {isListing && (
            <Button
              size="sm"
              colorScheme="red"
              mt="2"
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation when clicking on the button
                openDeListModal(nft); // Open the DeListNFTModal for the selected NFT
              }}
            >
              Cancel Listing
            </Button>
          )}
          {isBid && (
            <Button
              size="sm"
              colorScheme="orange"
              mt="2"
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation when clicking on the button
                openCancelBidModal(nft);
              }}
            >
              Cancel Bid
            </Button>
          )}
          {!isListing && !isBid && (
            <Button
              size="sm"
              colorScheme="teal"
              mt="2"
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation when clicking on the button
                openListModal(nft);
              }}
            >
              List for Sale
            </Button>
          )}
        </Box>
      </Box>
    );
  };


  return (
    <Box p={5}>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Assets</Tab>
          <Tab>Listings</Tab>
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
                  <Input placeholder="Contract Address" value={''} onChange={(e) => setContractAddresses([...contractAddresses, e.target.value])} />
                  <Button mt={4} onClick={() => {
                    localStorage.setItem('contractAddresses', contractAddresses);
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
              {listings.map((listing, index) => {
                // Ensure each listing has contractAddress and tokenId
                if (!listing.contractAddress || !listing.tokenId) {
                  console.error("Listing missing critical navigation data:", listing);
                  return null; // Skip rendering this NFTCard for problematic listing
                }
                return (
                  <NFTCard
                    key={index}
                    nft={listing}
                    price={listing.price}
                    isListing={true}
                    isBid={false}
                  />
                );
              })}
              <ListNFTModal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} contractAddress={selectedNFT.contractAddress} tokenId={selectedNFT.tokenId} />
            </Box>
          </TabPanel>
          <TabPanel>
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
              {bids.map((bid, index) => {
                // Ensure each bid has contractAddress and tokenId
                if (!bid.contractAddress || !bid.tokenId) {
                  console.error("Bid missing critical navigation data:", bid);
                  return null; // Skip rendering this NFTCard for problematic bid
                }
                return (
                  <NFTCard
                    key={index}
                    nft={bid}
                    price={bid.value}
                    isListing={false}
                    isBid={true}
                  />
                );
              })}
            </Box>
            <CancelBidModal
              isOpen={isCancelBidModalOpen}
              onClose={() => setIsCancelBidModalOpen(false)}
              contractAddress={selectedNFTForBidCancel?.contractAddress}
              tokenId={selectedNFTForBidCancel?.tokenId}
            />
          </TabPanel>

        </TabPanels>

      </Tabs>
      {/* Am placing the DeListNFTModal , outside the Tabs component but inside the Box component */}
      <DeListNFTModal
        isOpen={isDeListModalOpen}
        onClose={() => setIsDeListModalOpen(false)}
        contractAddress={selectedNFTForDelist?.contractAddress}
        tokenId={selectedNFTForDelist?.tokenId}
      />
    </Box>
  );
};

export default Wallet;