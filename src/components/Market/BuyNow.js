import React from 'react';
import { Button } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import MarketABI from '../../abi/market.json'; // Make sure this path is correct

const BuyNow = ({ erc721Address, tokenId, price }) => {
    const { account, library } = useWallet();
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;

    const handleBuyNow = async () => {
        if (!account || !library) {
            alert('Please connect your wallet first.');
            return;
        }

        const signer = library.getSigner(account);
        const contract = new ethers.Contract(marketplaceAddress, MarketABI, signer);

        try {
            const transaction = await contract.buyToken(erc721Address, tokenId, { value: price });
            await transaction.wait();
            alert('Bought successful!');
        } catch (error) {
            console.error('Transaction failed:', error);
            alert('Transaction failed. See console for details.');
        }
    };

    return (
        <Button colorScheme="teal" onClick={handleBuyNow}>
            Buy Now
        </Button>
    );
};

export default BuyNow;
