import React from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Collections from '../components/Collections'
import ExploreNFTs from '../components/ExploreNFTs'

function Explore() {
  return (
    <div className='py-20 justify-center items-center flex sm:px-5 sm:py-16'>
      <div className='w-[1257px] sm:w-full'>
          <h1 className='font-semibold font-Kallisto text-black-400 uppercase tracking-wider text-[48px] dark:text-white sm:text-2xl'>Explore Nfts</h1>

          <div className='flex gap-10 mt-8 breadcramps sm:gap-4 sm:mt-4'>
            <NavLink to='collections' className='text-black-400 font-Kallisto uppercase font-semibold text-sm tracking-widest dark:text-white sm:text-[12px]'>Collections</NavLink>
            <NavLink to='nfts' className='text-black-400 font-Kallisto uppercase font-semibold text-sm tracking-widest dark:text-white sm:text-[12px]'>NFTS</NavLink>
          </div>

          <Routes>
            <Route index element={<Navigate to='/explore/nfts' />} />
            <Route path='nfts' element={<ExploreNFTs />} />
            <Route path='collections' element={<Collections />} />
          </Routes>

      </div>
    </div>
  )
}

export default Explore
