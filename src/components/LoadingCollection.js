import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import LoadingNFT from './LoadingNFT'

function LoadingCollection() {
    return (



        <div className='pt-[75px] w-full '>
            <SkeletonTheme baseColor="#E4E4E4" highlightColor="#f5f5f5">
                <div className='w-full sm:w-full sm:h-[150px] h-[400px]'>
                    <Skeleton duration={0.9} count={1} className='w-[285px] h-[400px] sm:w-full sm:h-[150px] ' />
                </div>
                

                    <div className='flex justify-center items-center mb-20'>


                <div className='w-[1257px] sm:w-full md:w-[95%] sm:px-4'>

                    <div className='shadow-2xl w-[200px] sm:h-[80px] sm:w-[80px]  -mt-20 sm:-mt-5 rounded-lg overflow-hidden'>
                    <Skeleton duration={0.9} count={1} width={200} height={200} className='w-[50px] h-10 object-cover rounded-lg' />
                    </div>

                    <div className='flex justify-start items-center gap-14 my-6 sm:flex-wrap sm:gap-4 mt-10'>
                        <Skeleton duration={0.9} count={2} width={80} height={12} className='w-[50px] h-10 object-cover rounded-lg' />
                        <Skeleton duration={0.9} count={2} width={80} height={12}  className='w-[50px] h-10 object-cover rounded-lg' />
                        <Skeleton duration={0.9} count={2} width={80} height={12}  className='w-[50px] h-10 object-cover rounded-lg' />
                        <Skeleton duration={0.9} count={2}  width={80} height={12}  className='w-[50px] h-10 object-cover rounded-lg' />
                    </div>
                        

                        {/* <Skeleton duration={0.9} count={1}  width={1200} height={12}  className='w-[50px] h-10 object-cover rounded-lg' />
                        <Skeleton duration={0.9} count={1}  width={400} height={12}  className='w-[50px] h-10 object-cover rounded-lg' /> */}
                    <div className='flex justify-start items-center gap-14 my-6 sm:flex-wrap sm:gap-7'>
                        <Skeleton duration={0.9} count={1} width={120} height={40} className='w-[50px] h-10 object-cover rounded-lg' />
                        <Skeleton duration={0.9} count={1} width={120} height={40} className='w-[50px] h-10 object-cover rounded-lg' />
                        {window.innerWidth > 768 && <>
                        <Skeleton duration={0.9} count={1} width={120} height={40} className='w-[50px] h-10 object-cover rounded-lg' />
                        <Skeleton duration={0.9} count={1} width={120} height={40} className='w-[50px] h-10 object-cover rounded-lg' />
                        </>}
                    </div>


                <div className={` self-end sm:w-full w-full mt-10`}>
            <div className='flex justify-start mb-20'>
              <div className={`flex justify-start items-stretch gap-9 sm:gap-2 flex-wrap mt-1 sm:mt-0 w-full`}>
                {[2,1,11,1,].map((p, i) => (
                  <LoadingNFT key={i}/>
                ))}
              </div>
            </div>
          </div>
                </div>
                </div>


            </SkeletonTheme>
        </div>
    )
}

export default LoadingCollection
