import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { IoMoon, IoSunny } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { HiMiniBars3CenterLeft } from "react-icons/hi2";
import { RxCross2 } from 'react-icons/rx';
import { MdOutlineExplore } from "react-icons/md";
import { PiWalletLight } from "react-icons/pi";

import { useWallet } from '../hooks/useWallet';


// Function to format the wallet address
const formatAddress = (address) => {
  return `${address.substring(0, 5)}...${address.substring(address.length - 3)}`;
};

function Navbar() {
  const [theme, setTheme] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const { connect, active, account, chainId } = useWallet();

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    else {
      setTheme('light');
    }
  }, [])

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleThemeSwitch = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className='fixed top-0 left-0 w-full z-[9999999] flex justify-center items-center dark:bg-black-600 bg-grey-10'>
      <div className='dark:bg-black-600 bg-grey-10  sm:px-5 w-[1257px] sm:w-full py-2.5 flex justify-between items-center '>
        <div className='flex gap-16 sm:gap-2 sm:justify-between sm:items-center sm:w-full'>
          <Link to='/' className='z-20' onClick={() => setDrawer(false)}>
            <img src={require('../assets/logo.034ef726.png')} className='w-10 sm:w-8' />
          </Link>

          <span className='z-20 rounded-md border-grey-50 py-1 px-2 sm:gap-2 gap-3 bg-white border-[1px] flex justify-start items-center dark:bg-black-500'>
            <CiSearch className='text-black-50 text-2xl sm:text-lg' />
            <input type='text' className='outline-none text-black-50 bg-transparent sm:text-[11px] w-[350px] sm:w-[180px] font-Kallisto text-sm font-medium tracking-wider' placeholder='NFTs, collections and users' />
          </span>

          <HiMiniBars3CenterLeft className='text-black-400 dark:text-white text-[30px] hidden sm:flex' onClick={() => setDrawer(true)} />
          <div className={`h-screen px-5 w-full absolute left-0 bg-white dark:bg-black-600 transition-all ease-out duration-200 z-0 ${drawer ? 'top-0' : '-top-[1000px]'}`}>
            <RxCross2 className={`absolute top-3 right-5 text-black-400 dark:text-white text-[30px]`} onClick={() => setDrawer(false)} />

            <nav className='flex w-full flex-col mt-28 gap-1'>
              <Link to='/explore' onClick={() => setDrawer(false)} className='flex items-center uppercase tracking-wider gap-4 p-2 px-1 hover:bg-grey-100/20 font-Kallisto text-[12px] text-black-400 dark:text-white'>
                <MdOutlineExplore className='text-lg text-black-400 dark:text-white' />
                EXPLORE
              </Link>
              <Link to='/wallet' onClick={() => setDrawer(false)} className='flex items-center uppercase tracking-wider gap-4 p-2 px-1 hover:bg-grey-100/20 font-Kallisto text-[12px] text-black-400 dark:text-white'>
                <PiWalletLight className='text-lg text-black-400 dark:text-white' />
                Wallet
              </Link>
              <div className='flex justify-between items-center uppercase tracking-wider gap-4 p-2 px-1 hover:bg-grey-100/20 font-Kallisto text-[12px] text-black-400 dark:text-white'>
                <div className='flex gap-4 items-center'>
                  {theme === 'dark' ?
                    <IoSunny className='text-lg text-black-400 dark:text-white' />
                    :
                    <IoMoon className='text-base text-black-400 dark:text-white' />
                  }
                  Dark mode
                </div>
                <span className={`rounded-3xl w-[50px] p-1.5 bg-grey-50/35 cursor-pointer flex ${theme !== 'dark' ? 'justify-start' : 'justify-end'}`} onClick={handleThemeSwitch}>
                  <span className='bg-white rounded-full w-3 h-3'></span>
                </span>
              </div>

            </nav>

            <button
              className='bg-black py-3 left-5 w-full mt-[20px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[12px] uppercase font-Kallisto font-bold tracking-widest text-white cursor-pointer outline-none hover:bg-grey-100/40 hover:text-black transition-all ease-linear duration-150'
              onClick={!active ? connect : undefined} // Connect wallet when not active
            >
              {!active ? (chainId ? 'Chain not supported' : 'Connect Wallet') : `${formatAddress(account)}`}
            </button>

          </div>
        </div>


        <div className='flex justify-end items-center gap-10 sm:hidden'>
          <NavLink to='/explore' className='font-Kallisto text-black-400 font-medium dark:text-white text-sm uppercase tracking-wide'>Explore</NavLink>
          <NavLink to='/wallet' className='font-Kallisto text-black-400 dark:text-white font-medium text-sm uppercase tracking-wide'>Wallet</NavLink>

          <span className={`rounded-3xl w-[70px] p-1.5 bg-grey-50/35 cursor-pointer flex ${theme !== 'dark' ? 'justify-start' : 'justify-end'} dark:bg-black-500`} onClick={handleThemeSwitch}>
            {theme !== 'dark' ?
              <img src={require('../assets/icon-moon.png')} />
              :
              <IoSunny className='text-white text-[26px] bg-grey-10/40 rounded-full p-1' />
            }
          </span>

          <button className='bg-black px-11 py-[10px] bg-black-400 dark:bg-black-500 rounded-[4px] text-[12px] uppercase font-Kallisto font-bold tracking-widest text-white cursor-pointer outline-none hover:bg-grey-100/40 hover:text-black transition-all ease-linear duration-150'
            onClick={!active ? connect : undefined} // Connect wallet when not active
          >
            {!active ? (chainId ? 'Chain not supported' : 'Connect Wallet') : `${formatAddress(account)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar
