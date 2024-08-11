'use client'
import Tooltip from "@/components/Common/Tooltip";
import Layout from "@/components/Layout";
import { sharedCamera } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from 'swr'

interface apiData {
  cameras: {
    count: number,
    next: string | null,
    previous: string | null,
    results: [sharedCamera]
  }
}

const fetcher = (url: string) => fetch(url, {
  method: 'GET',
  credentials: 'include',
}).then((res) => res.json())

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [totalCameras, setTotalCameras] = useState<number | null>(null)
  const { data, error } = useSWR<apiData>(process.env.NEXT_PUBLIC_API! + process.env.NEXT_PUBLIC_API_PORT + '/api/user/shared-cameras/', fetcher, { refreshInterval: 0 })

  useEffect(() => {
    if (data?.cameras.count && totalCameras === null) {
      setTotalCameras(data.cameras.count)
    }

    if (totalCameras === 0) {
      setIsLoading(false)
    }
  }, [data, totalCameras, isLoading])

  return (
    <Layout showHeader={true}>
      <h3 className="text-xl text-center font-semibold text-gray-800 group-hover:text-gray-600">
        Shared Cameras
      </h3>
      {isLoading &&
        <div className="absolute top-0 w-11/12 mx-auto min-h-screen flex justify-center items-center">
          <div className="animate-spin size-8 border-[4px] border-current border-t-transparent text-indigo-600 rounded-full">
          </div>
        </div>}
      <div className="absolute top-0 w-11/12 mx-auto min-h-screen flex justify-center items-center">

        {error && <div>{error}</div>}
        {data && data.cameras &&
          <div className={`w-full h-full flex justify-center flex-wrap gap-5 ${isLoading && 'opacity-0 pointer-events-none'}`}>
            {data.cameras.results.map(item => {
              return (
                <Link href={`/camera/${item.id}`} key={item.id}>
                  <div className="w-[550px] h-[400px] group rounded-lg hover:shadow-lg transition cursor-pointer">
                    <div className="w-full h-4/5 overflow-hidden">
                      <Image
                        unoptimized={true}
                        alt={item.name}
                        overrideSrc={item.streams.find(s => s.format === 'mjpeg')?.url ?? ''}
                        src={item.streams.find(s => s.format === 'mjpeg')?.url ?? ''}
                        width={600}
                        height={400}
                        className="w-full h-full group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out"
                        objectFit="cover"
                        onLoad={() => setTotalCameras(totalCameras! - 1)}
                      />
                    </div>
                    <div className="border w-full h-1/5 border-t-transparent rounded-b-lg relative p-1">
                      {item.has_recording &&
                        <div className="absolute top-1 right-1 text-red-500">
                          <Tooltip content="recordings available">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 animate-pulse">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                            </svg>
                          </Tooltip>
                        </div>
                      }
                      <div className="absolute bottom-0 left-1">
                        <div className="uppercase text-xs font-semibold text-gray-500">
                          id: {item.id}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-1">
                        {item.status === 'online' &&
                          <div className="flex items-center gap-1 text-xs font-semibold text-green-500 uppercase leading-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span>online</span>
                          </div>
                        }
                        {item.status === 'offline' &&
                          <div className="flex items-center gap-1 text-xs font-semibold text-red-500 uppercase leading-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span>offline</span>
                          </div>
                        }
                        {item.status === 'unknown' &&
                          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase leading-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                            </span>
                            <span></span>
                          </div>
                        }
                      </div>
                      <div className="text-lg text-center font-semibold">{item.name}</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>}
      </div>
    </Layout>
  );
}
