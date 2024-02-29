import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import ERC721ABI from '../../abi/erc721.json';
import MarketABI from '../../abi/market.json';
import { useWallet } from '../../hooks/useWallet';



const ListNFTModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('24h');
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { account, library } = useWallet();
    const toast = useToast();

    const listNFT = async () => {
        console.log("Attempting to list NFT with:", { contractAddress, tokenId, price });

        if (!price || !duration) {
            alert('Please fill in all fields and ensure you have a valid contract address and token ID.');
            return;
        }

        const erc721Contract = new ethers.Contract(contractAddress, ERC721ABI, library.getSigner());
        const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());

        // Convert price to wei
        const priceInWei = ethers.utils.parseEther(price);

        // Calculate expiry timestamp based on duration
        let expiryTimestamp = Date.now() / 1000; // current timestamp in seconds
        switch (duration) {
            case '24h':
                expiryTimestamp += 24 * 60 * 60;
                break;
            case '7d':
                expiryTimestamp += 7 * 24 * 60 * 60;
                break;
            case '1m':
                expiryTimestamp += 30 * 24 * 60 * 60;
                break;
            case '3m':
                expiryTimestamp += 3 * 30 * 24 * 60 * 60;
                break;
            case '6m':
                expiryTimestamp += 6 * 30 * 24 * 60 * 60;
                break;
            default:
                expiryTimestamp += 24 * 60 * 60; // default to 24 hours
        }

        try {
            // Check if the marketplace is approved
            const isApproved = await erc721Contract.isApprovedForAll(account, marketplaceAddress);
            if (!isApproved) {
                // Request approval
                const txApprove = await erc721Contract.setApprovalForAll(marketplaceAddress, true);
                await txApprove.wait();
            }

            // List the NFT
            const txList = await marketContract.listToken(contractAddress, tokenId, priceInWei, Math.floor(expiryTimestamp));
            await txList.wait();

            toast({
                title: 'Listing Successful',
                description: 'Your NFT has been listed for sale.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onClose(); // Close the modal after successful listing
        } catch (error) {
            console.error('Failed to list NFT:', error);
            toast({
                title: 'Listing Failed',
                description: 'Error listing NFT. See console for details.',
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
                <ModalHeader>List NFT for Sale</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Price in ETH</FormLabel>
                        <Input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price in ETH" />
                    </FormControl>
                    <FormControl mt={4}>
                        <FormLabel>Duration</FormLabel>
                        <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="24h">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="1m">1 month</option>
                            <option value="3m">3 months</option>
                            <option value="6m">6 months</option>
                        </Select>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={listNFT}>
                        Complete Listing
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ListNFTModal;
