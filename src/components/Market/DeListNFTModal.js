import React from 'react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json'; // Adjust the import path as needed
import { useWallet } from '../../hooks/useWallet';

const DeListNFTModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { library } = useWallet();

    // const showToast = (message, status) => {
    //     //  toast .
    //     console.log(`${status}: ${message}`);
    // };
    const showToast = (message) => {
        alert(message);
    };

    const deListNFT = async () => {
        if (!library || !contractAddress || !tokenId) {
            showToast('Please ensure you have selected a valid NFT to delist.', 'error');
            return;
        }

        try {
            const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
            const tx = await marketContract.delistToken(contractAddress, tokenId);
            await tx.wait();

            showToast('The NFT has been successfully delisted.', 'success');
            onClose(); // Close the modal after successful delisting
        } catch (error) {
            console.error('Failed to delist NFT:', error);
            showToast('Failed to delist NFT. See console for details.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}></div>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full">
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Delist NFT</h3>
                        <p className="text-sm text-gray-500">Are you sure you want to delist this NFT?</p>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-3">
                        <button className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none" onClick={deListNFT}>
                            Confirm Delist
                        </button>
                        <button className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeListNFTModal;
