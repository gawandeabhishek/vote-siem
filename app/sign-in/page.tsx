import { SignIn } from '@clerk/nextjs'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <main className='h-screen w-full flex justify-center items-center'>
        <SignIn />
    </main>
  )
}

export default page