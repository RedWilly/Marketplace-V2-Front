import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json';
import ERC721ABI from '../../abi/erc721.json';
import { useWallet } from '../../hooks/useWallet';

const AcceptOffer = ({ isOpen, onClose, erc721Address, tokenId, bidder, value }) => {
    const { account, library } = useWallet();
    const [isApproved, setIsApproved] = useState(false);
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;

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
        if (!erc721Address) {
            console.error("ERC721 Address is undefined");
            return;
        }
        const contract = new ethers.Contract(erc721Address, ERC721ABI, library.getSigner());
        try {
            const tx = await contract.setApprovalForAll(marketplaceAddress, true);
            await tx.wait();
            setIsApproved(true);
            alert('Approval successful. The contract is now approved to transfer your NFT.');
        } catch (error) {
            alert(`Approval failed. Error: ${error.message}`);
        }
    };

    const handleAcceptOffer = async () => {
        if (!isApproved) {
            alert('Not approved. Please approve the contract to transfer your NFT.');
            return;
        }
        const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
        try {
            const tx = await marketContract.acceptBidForToken(
                erc721Address,
                tokenId,
                bidder,
                ethers.utils.parseUnits(value.toString(), 'wei')
            );
            await tx.wait();
            onClose(); // Close the modal
            alert('Offer accepted successfully. The NFT has been successfully transferred to the bidder.');
        } catch (error) {
            alert(`Accept offer failed. Error: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center" onClick={onClose}>
            <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Accept Offer</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to accept this offer?
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center p-6 border-t border-solid border-gray-200 rounded-b">
                    {!isApproved && (
                        <button
                            style={{
                                backgroundColor: 'blue',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginRight: '10px'
                            }}
                            onClick={handleApprove}>
                            Approve
                        </button>
                    )}
                    <button
                        disabled={!isApproved}
                        style={{
                            backgroundColor: isApproved ? 'green' : 'grey',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: isApproved ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                        }}
                        onClick={handleAcceptOffer}>
                        Accept Offer
                    </button>
                </div>
            </div>
        </div>

    );
};

export default AcceptOffer;
