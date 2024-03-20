import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import MarketABI from '../../abi/market.json';

import {
    useToast
} from '@chakra-ui/react';

const BuyNow = ({ erc721Address, tokenId, price, className }) => {
    const { account, library } = useWallet();
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleBuyNow = async () => {
        if (!account || !library) {
            toast({
                title: 'Connect Wallet',
                description: 'Please connect your wallet first.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);

        const signer = library.getSigner(account);
        const contract = new ethers.Contract(marketplaceAddress, MarketABI, signer);

        try {
            const transaction = await contract.buyToken(erc721Address, tokenId, { value: price });
            await transaction.wait();
            toast({
                title: 'Purchase Successful',
                description: 'You have successfully purchased the NFT.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Transaction failed:', error);
            toast({
                title: 'Transaction Failed',
                description: 'Failed to complete the purchase. Please check the console for details.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className={className}
            onClick={handleBuyNow}
            disabled={isLoading}
        >
            {isLoading ? 'Purchasing...' : 'Buy Now'}
        </button>
    );
};

export default BuyNow;
