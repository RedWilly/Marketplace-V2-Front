import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useToast
} from '@chakra-ui/react';
import MarketABI from '../../abi/market.json'; // Adjust path as necessary
import ERC721ABI from '../../abi/erc721.json'; // Adjust path as necessary
import { useWallet } from '../../hooks/useWallet';

const AcceptOffer = ({ isOpen, onClose, erc721Address, tokenId, bidder, value }) => {
    const { account, library } = useWallet();
    const toast = useToast();
    const [isApproved, setIsApproved] = useState(false);
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;

    // Fetch and log the owner of the NFT to see why the transaction revert and cross check if the owner is the same
    useEffect(() => {
        const fetchOwner = async () => {
            if (!library || !erc721Address || !tokenId) return;
            try {
                const contract = new ethers.Contract(erc721Address, ERC721ABI, library);
                const owner = await contract.ownerOf(tokenId);
                console.log(`Owner of NFT (Token ID: ${tokenId}):`, owner);
            } catch (error) {
                console.error("Error fetching NFT owner:", error);
            }
        };
        fetchOwner();
    }, [library, erc721Address, tokenId]);

    // Check if the contract is approved to transfer the NFT on behalf of the owner
    useEffect(() => {
        const checkApproval = async () => {
            if (!account || !library || !erc721Address) return;
            const contract = new ethers.Contract(erc721Address, ERC721ABI, library.getSigner());
            const isApproved = await contract.isApprovedForAll(account, marketplaceAddress);
            setIsApproved(isApproved);
        };
        checkApproval();
    }, [account, library, erc721Address, marketplaceAddress]);

    const handleApprove = async () => {
        const contract = new ethers.Contract(erc721Address, ERC721ABI, library.getSigner());
        try {
            const tx = await contract.setApprovalForAll(marketplaceAddress, true);
            await tx.wait();
            setIsApproved(true);
            toast({
                title: 'Approval successful',
                description: 'The contract is now approved to transfer your NFT.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Approval failed',
                description: `Error: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleAcceptOffer = async () => {
        if (!isApproved) {
            toast({
                title: 'Not approved',
                description: 'Please approve the contract to transfer your NFT.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
        try {
            console.log("Accepting offer with parameters:", {
                erc721Address,
                tokenId,
                bidder,
                value: ethers.utils.formatUnits(value, 'wei') // Ensure value is in wei
            });
            // const tx = await marketContract.acceptBidForToken(erc721Address, tokenId, bidder, value);
            const tx = await marketContract.acceptBidForToken(
                erc721Address,
                tokenId,
                bidder,
                ethers.utils.parseUnits(value.toString(), 'wei') // Ensure value is correctly formatted in wei
            );
            await tx.wait();
            onClose(); // Close the modal
            toast({
                title: 'Offer accepted successfully',
                description: 'The NFT has been successfully transferred to the bidder.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Accept offer failed',
                description: `Error: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Accept Offer</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Are you sure you want to accept this offer?
                </ModalBody>
                <ModalFooter>
                    {!isApproved && (
                        <Button colorScheme="blue" mr={3} onClick={handleApprove}>
                            Approve Contract
                        </Button>
                    )}
                    <Button colorScheme="green" onClick={handleAcceptOffer} isDisabled={!isApproved}>
                        Accept Offer
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AcceptOffer;
