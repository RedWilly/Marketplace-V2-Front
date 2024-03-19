import React, { useState } from 'react';
import { ethers } from 'ethers';
import ERC721ABI from '../../abi/erc721.json';
import MarketABI from '../../abi/market.json';
import { useWallet } from '../../hooks/useWallet';

const ListNFTModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('24h');
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { account, library } = useWallet();

    // const showToast = (message, status) => {
    //     // toast ?.
    //     console.log(`${status}: ${message}`);
    // };
    const showToast = (message) => {
        alert(message);
    };

    const listNFT = async () => {
        console.log("Attempting to list NFT with:", { contractAddress, tokenId, price });

        if (!price || !duration) {
            showToast('Please fill in all fields and ensure you have a valid contract address and token ID.', 'error');
            return;
        }

        const erc721Contract = new ethers.Contract(contractAddress, ERC721ABI, library.getSigner());
        const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
        const priceInWei = ethers.utils.parseEther(price);

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
            const isApproved = await erc721Contract.isApprovedForAll(account, marketplaceAddress);
            if (!isApproved) {
                const txApprove = await erc721Contract.setApprovalForAll(marketplaceAddress, true);
                await txApprove.wait();
            }

            const txList = await marketContract.listToken(contractAddress, tokenId, priceInWei, Math.floor(expiryTimestamp));
            await txList.wait();

            showToast('Your NFT has been listed for sale.', 'success');
            onClose();
        } catch (error) {
            console.error('Failed to list NFT:', error);
            showToast('Error listing NFT. See console for details.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}></div>
            <div className="fixed top-20 left-1/4 right-1/4 bg-white rounded-lg shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">List NFT for Sale</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Close</span>X
                    </button>
                </div>
                <div className="mb-4">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price in ETH</label>
                    <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Enter price in ETH" />
                </div>
                <div className="mb-4">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
                    <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        <option value="24h">24 hours</option>
                        <option value="7d">7 days</option>
                        <option value="1m">1 month</option>
                        <option value="3m">3 months</option>
                        <option value="6m">6 months</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={listNFT} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Complete Listing
                    </button>
                    <button onClick={onClose} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
};

export default ListNFTModal;
