import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function LoadingNFT() {
  return (
    <SkeletonTheme baseColor="#E4E4E4" highlightColor="#f5f5f5">
        <div className='w-[285px] sm:w-[48%] h-[400px]'>
            <Skeleton duration={0.9} count={1} className='w-[285px] sm:w-[48%] h-[400px] rounded-lg '/>
        </div>
    </SkeletonTheme>
  )
}

export default LoadingNFT
