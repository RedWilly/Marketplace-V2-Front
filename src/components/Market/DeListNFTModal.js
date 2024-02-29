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
    useToast,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json'; // Adjust the import path as needed
import { useWallet } from '../../hooks/useWallet';

const DeListNFTModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { library } = useWallet();
    const toast = useToast();

    const deListNFT = async () => {
        if (!library || !contractAddress || !tokenId) {
            toast({
                title: 'Error',
                description: 'Please ensure you have selected a valid NFT to delist.',
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
            return;
        }

        try {
            const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
            const tx = await marketContract.delistToken(contractAddress, tokenId);
            await tx.wait();

            toast({
                title: 'NFT Delisted',
                description: 'The NFT has been successfully delisted.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onClose(); // Close the modal after successful delisting
        } catch (error) {
            console.error('Failed to delist NFT:', error);
            toast({
                title: 'Delisting Failed',
                description: 'Failed to delist NFT. See console for details.',
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
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
