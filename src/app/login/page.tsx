'use client'
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

export default function Login() {
    const router = useRouter()
    const [error, setError] = useState<null | string>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const login = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API! + process.env.NEXT_PUBLIC_API_PORT + '/api/user/login/', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })

            // Handle response if necessary
            if (response.status === 200 || response.status === 201) {
                router.push("/")
            } else {
                const data = await response.json()
                if (data.error) {
                    setError(data.error.detail)
                }
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
        }
    }

    return (
        <Layout showHeader={false}>
            <div>
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <Image
                            alt="Angelcam"
                            src="https://developers.angelcam.com/assets/logo-angelcam.svg"
                            className="mx-auto h-10 w-auto"
                            width={10}
                            height={10}
                        />
                        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                            Sign in to your account
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={(e) => login(e)} className="space-y-4">
                            <div>
                                <label htmlFor="token" className="block text-sm font-medium leading-6 text-gray-900">
                                    Personal Access Token
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        id="token"
                                        name="token"
                                        type="password"
                                        required
                                        className="block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>

                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className={`flex w-full justify-center items-center rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                                    ${loading && 'pointer-events-none opacity-50 cursor-not-allowed'}
                                    `}
                                >
                                    {!loading ?
                                        <span>Sign in</span>
                                        :
                                        <>
                                            <span className="pr-2">Processing...</span>
                                            <div className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading">
                                            </div>
                                        </>
                                    }
                                </button>
                            </div>
                            {error &&
                                <div className="text-center w-full text-sm font-medium leading-6 text-red-600">
                                    {error}
                                </div>
                            }
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}