'use client'
import { getCookies } from "@/utils";
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter()

    const logout = async () => {
        try {
            const csrftoken = getCookies(document.cookie)['csrftoken']

            const response = await fetch(process.env.NEXT_PUBLIC_API! + process.env.NEXT_PUBLIC_API_PORT + '/api/user/logout/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "X-CSRFToken": csrftoken
                }
            })

            // Handle response if necessary
            if (response.status === 200 || response.status === 201) {
                router.push("/login")
            }
        } catch (error) {

        }
    }

    return (
        <div className="w-full h-[10%] flex items-center justify-center z-10">
            <div className="w-1/2 h-12 border rounded-full flex items-center justify-between px-2">
                <Link href={"/"}>
                    <Image
                        alt="Angelcam"
                        src="https://developers.angelcam.com/assets/logo-angelcam.svg"
                        className="h-7 w-auto"
                        width={7}
                        height={7}
                    />
                </Link>
                <button
                    className={`capitalize flex justify-center items-center rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                    onClick={() => logout()}
                >
                    logout
                </button>
            </div>
        </div>
    )
}

export default Navbar