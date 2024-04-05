import React, { useState, useEffect } from 'react'
import Dropdown from './Dropdown'
import { IoIosArrowDown } from 'react-icons/io'
import Card2 from './Card2'
import { RxCross2 } from 'react-icons/rx'
import { GoCheckCircleFill } from 'react-icons/go'
import { Link } from 'react-router-dom'

//Backend
import { ethers } from 'ethers';
import ExploreNFThelper from './ExploreNFThelper';
import MarketplaceApi from "../utils/MarketplaceApi"; // Ensure this is imported


function ExploreNFTs() {
  const [sidebar, setSideBar] = useState(window.innerWidth < 768 ? false : true)
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const AllListingResponse = await MarketplaceApi.fetchActiveListings(); // Fetch data from the API
        // Adjusted to directly pass the response since it's already an array
        const updatedListings = await ExploreNFThelper({ listings: AllListingResponse });
        setListings(updatedListings);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className='flex justify-center items-start'>
      <div className='w-[1257px] overflow-hidden'>
        <div className={`mt-6 flex justify-center items-start gap-9`}>
          {sidebar && <span className='w-[287px] sm:w-full sm:top-[45px] overflow-hidden sm:fixed sm:z-50 sm:h-screen'>
            <div className='relative z-30 border-[1px]  rounded-md bg-white dark:bg-transparent sm:dark:bg-black-600 border-grey-50'>
              <div className='px-5 py-2  flex justify-between items-center gap-3 cursor-pointer' onClick={() => setSideBar(s => !s)}>
                <p className='text-[13px] font-medium tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100'>Filter</p>
                <RxCross2 className={` hidden sm:flex text-xl text-black-50 dark:text-white transition-all ease-in duration-100`} />
                <IoIosArrowDown className={`sm:hidden text-base text-black-50 dark:text-white transition-all ease-in duration-100 ${sidebar ? 'rotate-180' : ''}`} />
              </div>
              {sidebar && <div className='px-5 flex flex-col gap-5 mt-2 pb-10 sm:h-screen'>
                <Card2 title="STATUS">
                  <div className='flex flex-col gap-1 pl-2'>
                    <div className='flex justify-between items-center'>
                      <p className='uppercase font-Kallisto font-normal dark:text-grey-100 text-black-50 tracking-wider text-[12px]'>For sale</p>
                      <input type='checkbox' />
                    </div>
                    {/* <div className='flex justify-between items-center'>
                    <p className='uppercase font-Kallisto font-normal dark:text-grey-100 text-black-50 tracking-wider text-[12px]'>On Auction</p>
                    <input type='checkbox' />
                  </div> */}
                    <div className='flex justify-between items-center'>
                      <p className='uppercase font-Kallisto font-normal dark:text-grey-100 text-black-50 tracking-wider text-[12px]'>has offers</p>
                      <input type='checkbox' />
                    </div>
                  </div>
                </Card2>
                <Card2 title="PRICE">
                  <div className='flex flex-col gap-2'>
                    {/* <Dropdown transparent={true} placeHolder={"currency"} options={[{}]} selectedOption={() => { }} /> */}
                    <div className='flex justify-between gap-2'>
                      <input type='number' className='border-grey-50 border-[1px] outline-none w-[50%] rounded-md p-.5 px-3 bg-transparent text-sm font-Kallisto text-black-50 dark:text-grey-100' placeholder='MIN' />
                      <input type='number' className='border-grey-50 border-[1px] outline-none w-[50%] rounded-md p-1.5 px-3 bg-transparent text-sm font-Kallisto text-black-50 dark:text-grey-100' placeholder='MAX' />
                    </div>
                  </div>
                </Card2>

                <div className='flex justify-between items-center'>
                  <p className='uppercase font-Kallisto font-semibold cursor-pointer dark:text-grey-100 text-black-400 tracking-wider text-[10px] underline'>clear</p>
                  <p className='uppercase font-Kallisto font-semibold cursor-pointer dark:text-blue-100 text-blue-200 tracking-wider text-[10px] underline'>apply</p>
                </div>
                {/* <Card2 title="COLLECTIONS">
                <span className='rounded-md border-grey-50 py-2 px-2 gap-2 bg-white border-[1px] flex justify-start items-center dark:bg-black-600'>
                  <CiSearch className='text-black-50 text-2xl sm:text-lg' />
                  <input type='text' className='outline-none text-black-50 bg-transparent w-full font-Kallisto text-[12px] font-medium tracking-wider' placeholder='Search' />
                </span>
              </Card2> */}

              </div>}
            </div>
          </span>}

          <div className={`${sidebar ? 'w-[75%]' : 'w-full'} self-end sm:w-full`}>
            <div className={`flex ${sidebar ? 'justify-end' : 'justify-between'} items-stretch gap-9 sm:flex-col sm:gap-2`}>
              {!sidebar && <span className='w-[282px] sm:hidden '>
                <div className='relative w-full z-30 border-[1px]  rounded-md bg-white dark:bg-black-600 border-grey-50'>
                  <div className='px-5 py-2  flex justify-between items-center gap-3 cursor-pointer' onClick={() => setSideBar(s => !s)}>
                    <p className='text-[12px] font-medium tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100'>Filter</p>
                    <IoIosArrowDown className={`text-base text-black-50 dark:text-grey-100 transition-all ease-in duration-100 ${sidebar ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </span>}
              {/* <span className={`rounded-md border-grey-50 py-1.5 px-2 gap-3 bg-white border-[1px] sm:w-full w-[610px] flex justify-start items-center dark:bg-black-600`}>
              <CiSearch className='text-black-50 text-2xl' />
              <input type='text' className='outline-none text-black-50 bg-transparent w-[100%]  font-Kallisto text-sm font-normal tracking-wider' placeholder='Search by Name' />
            </span> */}
              <span className={`w-[282px] sm:hidden`}>
                <Dropdown transparent={true} placeHolder={"Filter"} options={[{ id: 'Trending', value: 'Price low to hight' }, { id: 'Top', value: 'price high to low' }]} selectedOption={() => { }} />
              </span>
              <div className='justify-between items-center gap-2 hidden sm:flex'>
                <span className={`w-[282px] sm:w-[50%]`}>
                  <Dropdown transparent={true} placeHolder={"Filter"} options={[{ id: 'Trending', value: 'Price low to hight' }, { id: 'Top', value: 'price high to low' }]} selectedOption={() => { }} />
                </span>
                <span className='w-[282px] sm:w-[50%] hidden sm:flex '>
                  <div className='relative w-full z-30 border-[1px]  rounded-md bg-white dark:bg-black-600 border-grey-50'>
                    <div className='px-5 py-2  flex justify-between items-center gap-3 cursor-pointer' onClick={() => setSideBar(s => !s)}>
                      <p className='text-[12px] font-medium tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100'>Filter</p>
                      <IoIosArrowDown className={`text-base text-black-50 dark:text-grey-100 transition-all ease-in duration-100 ${sidebar ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </span>
              </div>
            </div>

            <div className='flex justify-center'>
              <div className={`flex justify-start items-stretch gap-9 sm:gap-2 flex-wrap mt-9 sm:mt-4`}>
                {listings.map((listing, index) => {
                  return <div key={index} className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
                    <Link to={`/collection/${listing.erc721Address}/${listing.tokenId}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                      <img src={listing.image} className='w-full h-full object-cover transition-all ease-linear saturate-100' />
                    </Link>
                    <div className='px-6 py-4 sm:px-3 sm:py-22'>
                      <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{listing.name}
                        <GoCheckCircleFill className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                      </h1>
                      <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 text-grey-100 dark:text-white sm:text-sm'>
                        {ethers.utils.formatEther(String(listing.price))} BTTC
                      </p>
                      <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>Last Sale $ 80</p>
                    </div>
                    <button className='bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'>
                      <p className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider'>{"Buy Now"}</p>
                    </button>
                  </div>
                })}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExploreNFTs
