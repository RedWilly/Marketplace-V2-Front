import React from 'react'
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import NFTDetail from './pages/NFTDetail';
import Wallet from './pages/Wallet';
import Collection from './pages/Collection';
import Footer from './components/Footer';
import Terms from './components/terms';

import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { ChakraProvider } from '@chakra-ui/react';
import Statstics from './pages/Statstics';




function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}


function App() {

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider>
        <div className='dark:bg-black-600 bg-grey-10'>
          <Navbar />
          <div className='dark:bg-black-600 bg-grey-10'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/explore/*' element={<Explore />} />
              <Route path='/wallet/*' element={<Wallet />} />
              <Route path='/statstics' element={<Statstics />} />
              <Route path="/collection/:contractAddress/:tokenId" element={<NFTDetail />} />
              <Route path="/collection/:contractAddress" element={<Collection />} />
              <Route path='/Terms' element={<Terms />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </ChakraProvider>
    </Web3ReactProvider>
  )
}

export default App
