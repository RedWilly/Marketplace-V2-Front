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

const CancelBidModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { library } = useWallet();

    const cancelBid = async () => {
        if (!library || !contractAddress || !tokenId) {
            alert('Please ensure you have selected a valid NFT to cancel the bid for.');
            return;
        }

        try {
            const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
            const tx = await marketContract.withdrawBidForToken(contractAddress, tokenId);
            await tx.wait();

            alert('Bid cancelled successfully!');
            onClose(); // Close the modal after successful bid cancellation
        } catch (error) {
            console.error('Failed to cancel bid:', error);
            alert('Error cancelling bid. See console for details.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Cancel Bid</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>Are you sure you want to cancel your bid on this NFT?</Text>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={cancelBid}>
                        Confirm Cancel Bid
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CancelBidModal;
