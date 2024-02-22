import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router components
import Home from './pages/Home';
import Wallet from './pages/Wallet'; // Make sure you've created this component
import Header from './components/Header';
import NFTDetail from './components/NFTDetail';
import Collection from './pages/Collection';
import { ApolloProvider } from '@apollo/client';
import client from './graphql/apollo-client'; // Adjust the import path as needed

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

function App() {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/collection/:contractAddress" element={<Collection />} />
              <Route path="/collection/:contractAddress/:tokenId" element={<NFTDetail />} />
              {/* You can add more routes here */}
            </Routes>
          </Router>
        </Web3ReactProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default App;
