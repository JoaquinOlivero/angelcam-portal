'use client'
import Camera from "@/components/Camera";
import Layout from "@/components/Layout"
import { camera } from "@/types/types"
import { notFound } from "next/navigation";
import useSWR from "swr";
import { useParams } from 'next/navigation'


const fetcher = (url: string) => fetch(url, {
    method: 'GET',
    credentials: 'include',
})
    .then((res) => {
        if (!res.ok) {
            throw new Error("error");
        }
        return res.json()
    })

const CameraPage = () => {
    const params = useParams<{ id: string; }>()
    const { data, error, isLoading } = useSWR<camera>(process.env.NEXT_PUBLIC_API! + process.env.NEXT_PUBLIC_API_PORT + '/api/user/shared-cameras/' + params.id + '/', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        refreshInterval: 0
    }
    )

    if (error) return notFound()

    return (
        <Layout showHeader={true}>
            {data &&
                <Camera data={data} />
            }
            {isLoading &&
                <div className="absolute top-0 left-0 w-full h-full mx-auto flex justify-center items-center">
                    <div className="animate-spin size-8 border-[4px] border-current border-t-transparent text-indigo-600 rounded-full">
                    </div>
                </div>
            }
            <div></div>
        </Layout>
    )
}


export default CameraPage