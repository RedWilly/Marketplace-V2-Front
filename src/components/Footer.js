import React from 'react'
import { CiTwitter } from 'react-icons/ci'
import { PiYoutubeLogoLight } from 'react-icons/pi'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <div className='flex flex-col gap-7  py-5  justify-center items-center sm:px-5'>
            <div className='w-[1257px] sm:w-full md:w-[95%]'>
                <div className='flex justify-between items-start sm:flex-col gap-4'>
                    <span>
                        <Link to='/' className='flex gap-4 items-center'>
                            <img src={require('../assets/logo.034ef726.png')} className='w-9 sm:w-7' />
                            <h1 className='font-medium font-Kallisto text-black-400 uppercase tracking-widest sm:text-sm text-2xl dark:text-white'>Rooni</h1>
                        </Link>
                        <p className='mt-4 w-[420px] sm:mt-4 text-[11px] tracking-widest font-Kallisto font-medium text-black-400/75 dark:text-grey-100 sm:text-[9px] sm:w-full'>The Very First Non-Fungible Token (NFT) Marketplace on Bittorrent Chain. Buy, Sell, Trade, Mint and Create exclusive Non-Fungible Digital Assets & Collectibles.</p>
                    </span>

                    <div className='border-[1px] rounded-md border-grey-50 overflow-hidden dark:border-white/50 flex items-center sm:rounded-lg sm:w-full'>
                        <input className='bg-transparent font-Kallisto font-medium sm:text-[10px] sm:p-2 text-[11px] sm:w-[70%] text-black-50 dark:text-white outline-none py-[10px] px-4 w-[400px]' placeholder='Enter your mail to join out mailing list' />
                        <button className='bg-black px-5 py-[10px] sm:py-2 sm:w-[30%] sm:px-3 sm:text-[9px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[11px] uppercase font-Kallisto font-medium tracking-widest text-white cursor-pointer outline-none hover:text-black-400 hover:bg-grey-100/20 hover:text-black transition-all ease-linear duration-150  dark:hover:text-white dark:hover:bg-grey-100'>
                            Yes Please
                        </button>
                    </div>
                </div>

                <div className='flex justify-start items-start gap-20 mt-4 flex-wrap sm:gap-6 sm:justify-between sm:mt-8'>
                    <div className='flex flex-col gap-4'>
                        <h1 className='font-medium font-Kallisto text-black-400/80 uppercase tracking-widest text-[15px] dark:text-white sm:text-[12px]'>Marketplace</h1>
                        <nav className='flex flex-col gap-1'>
                            <Link to='/explore/nfts' className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>ALL NFTS</Link>
                            <Link to='/' className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>STATISTICS</Link>
                            <Link to='/explore/collections' className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>COLLECTIBLES</Link>
                        </nav>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <h1 className='font-medium font-Kallisto text-black-400/80 uppercase tracking-widest text-[15px] dark:text-white sm:text-[12px]'>LAUNCHPAD</h1>
                        <nav className='flex flex-col gap-1'>
                            <Link to='/' className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>APPLY FOR LAUNCHPAD</Link>
                            <Link to='/' className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>NFT LAUNCHES</Link>
                        </nav>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <h1 className='font-medium font-Kallisto text-black-400/80 uppercase tracking-widest text-[15px] dark:text-white sm:text-[12px]'>HELP CENTER</h1>
                        <nav className='flex flex-col gap-1'>
                            <Link to='/' className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>FAQ</Link>
                            <Link to='/' className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>GETTING STARTED</Link>
                        </nav>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <h1 className='font-medium font-Kallisto text-black-400/80 uppercase tracking-widest text-[15px] dark:text-white sm:text-[12px]'>RESOURCES</h1>
                        <nav className='flex flex-col gap-1'>
                            <a href='https://wallet.bittorrentchain.io/bridge' target="_blank" rel="noopener noreferrer" className='text-[12px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[10px]'>BRIDGE TO BTTC</a>
                        </nav>
                    </div>
                </div>

                <div className='flex justify-between items-center sm:flex-col'>
                    <p className='mt-4 w-[420px] sm:mt-4 text-[11px] tracking-widest sm:w-full sm:text-center  font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[9px]'>Rooni @ {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
                    <div className="flex justify-end sm:flex-col items-center gap-2">
                        <p className='flex sm:flex-col mt-4 sm:mt-4 text-[11px] tracking-widest font-Kallisto font-medium text-black-50/80 dark:text-grey-100 sm:text-[9px]'>TERMS AND CONDITIONS PRIVACY POLICY</p>
                        <span className='flex gap-2'>
                            <PiYoutubeLogoLight className='cursor-pointer -mb-2 text-2xl text-black-400 dark:text-grey-100' />
                            <CiTwitter className='cursor-pointer text-2xl  -mb-2 text-black-400 dark:text-grey-100' />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer
