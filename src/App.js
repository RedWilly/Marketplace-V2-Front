import React from 'react'
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import NFTDetail from './pages/NFTDetail';
import Wallet from './pages/Wallet';
import Collection from './pages/Collection';
import Footer from './components/Footer';

import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { ApolloProvider } from '@apollo/client';
import client from './graphql/apollo-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

setInterval(()=>{
  toast.success("hello")
  toast.error("this is error")
}, 5000)

function App() {

  return (
    <ApolloProvider client={client}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <div className='dark:bg-black-600 bg-grey-10'>
          <Navbar />
          <div className='dark:bg-black-600 bg-grey-10'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/explore/*' element={<Explore />} />
              <Route path='/wallet/*' element={<Wallet />} />
              <Route path="/collection/:contractAddress/:tokenId" element={<NFTDetail />} />
              <Route path="/collection/:contractAddress" element={<Collection />} />
            </Routes>
          </div>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <Footer />
        </div>
      </Web3ReactProvider>
    </ApolloProvider>
  )
}

export default App
