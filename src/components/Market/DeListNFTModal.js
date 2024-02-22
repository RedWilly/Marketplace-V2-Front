import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json'; // Adjust the import path as needed
import { useWallet } from '../../hooks/useWallet';

const DeListNFTModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { library } = useWallet();

    const deListNFT = async () => {
        if (!library || !contractAddress || !tokenId) {
            alert('Please ensure you have selected a valid NFT to delist.');
            return;
        }

        try {
            const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
            const tx = await marketContract.delistToken(contractAddress, tokenId);
            await tx.wait();

            alert('NFT delisted successfully!');
            onClose(); // Close the modal after successful delisting
        } catch (error) {
            console.error('Failed to delist NFT:', error);
            alert('Error delisting NFT. See console for details.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Delist NFT</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>Are you sure you want to delist this NFT?</Text>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={deListNFT}>
                        Confirm Delist
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DeListNFTModal;
