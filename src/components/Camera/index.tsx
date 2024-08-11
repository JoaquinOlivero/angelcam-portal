'use client'
import { camera, records, recordStream, segment } from "@/types/types"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import VideoJS from "../VideoJS";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import { useParams } from "next/navigation";
import useSWR from "swr";

type Props = {
    data: camera
}

const Camera = ({ data }: Props) => {
    const playerRef = useRef<Player | null>(null);
    const [streamUrl, setStreamUrl] = useState(data.camera.streams.find(s => s.format === 'mp4')?.url ?? data.camera.streams[0].url)
    const [streamFormat, setStreamFormat] = useState(data.camera.streams.find(s => s.format === 'mp4')?.format ?? data.camera.streams[0].format)

    useEffect(() => {
    }, [streamUrl, streamFormat])


    const changeStream = (url: string, format: string) => {
        setStreamUrl(url)
        setStreamFormat(format)
    }

    const videoJsOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: streamUrl ?? '',
            type: streamFormat ? streamFormat === 'mp4' ? "video/mp4" : 'application/x-mpegURL' : ''
        }],
    };

    const handlePlayerReady = (player: Player) => {
        if (playerRef.current) playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            videojs.log('player is waiting');
        });

        player.on('dispose', () => {
            videojs.log('player will dispose');
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xl text-center font-semibold text-gray-800 group-hover:text-gray-600">
                {data.camera.name}
            </h3>

            <div className="w-11/12 mx-auto flex justify-center items-center">
                <div className="w-1/2 relative">
                    <div className={`w-full h-full flex justify-center relative`}>
                        {streamFormat !== 'mjpeg' ?
                            <div>
                                <div className="w-full h-auto">
                                    <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
                                </div>
                            </div>
                            :
                            <Image
                                unoptimized={true}
                                alt={data.camera.name}
                                overrideSrc={streamUrl}
                                src={streamUrl}
                                width={600}
                                height={400}
                                className="w-full h-[400px]"
                                objectFit="cover"
                            />
                        }

                        <div className="absolute top-0 left-full translate-x-1/2 flex flex-col text-nowrap">
                            <h4 className="text-xl text-center font-semibold text-gray-800">Stream source</h4>
                            <div className="flex flex-col gap-2">
                                {data.camera.streams.map(stream => {
                                    return <div key={stream.url} onClick={() => changeStream(stream.url, stream.format)} className={`inline-flex group/format gap-1 items-center rounded-md  px-2 py-2 text-xs font-medium transition-transform ease-in-out cursor-pointer ${streamFormat === stream.format ? 'bg-green-100 text-green-700 scale-105' : 'bg-gray-100 text-gray-600 hover:scale-105 hover:bg-green-50 hover:text-green-700'}`}>
                                        <span className="relative flex h-2 w-2">
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${streamFormat === stream.format ? 'bg-green-500' : 'bg-gray-500 group-hover/format:bg-green-400'}`}></span>
                                        </span>
                                        <span>{stream.format}</span>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {data.interval_pairs &&
                <AvailableRecordings intervals={data.interval_pairs} changeStream={changeStream} />
            }
        </div>
    )
}

export default Camera


const fetcher = (url: string, queryParams = '') => fetch(`${url}${queryParams}`, {
    method: 'GET',
    credentials: 'include',
})
    .then((res) => {
        if (!res.ok) {
            throw new Error("error");
        }
        return res.json()
    })

type AvailableRecordingsProps = {
    intervals: string[][],
    changeStream: (url: string, format: string) => void
}

const AvailableRecordings = ({ intervals, changeStream }: AvailableRecordingsProps) => {
    const params = useParams<{ id: string; }>()
    const [queryParams, setQueryParams] = useState<string>('?camera_id=' + params.id + '&start=' + intervals![intervals!.length - 1][0] + '&end=' + intervals![intervals!.length - 1][1])
    const [availableRecordings, setAvailableRecordings] = useState<Array<segment>>([])
    const [recordDate, setRecordDate] = useState<number>(0)
    const [streamId, setStreamId] = useState<null | number>(null)

    //@ts-ignore
    const { error, isLoading } = useSWR<records>([process.env.NEXT_PUBLIC_API! + process.env.NEXT_PUBLIC_API_PORT + '/api/user/recordings/', queryParams], ([url, queryParams]) => fetcher(url, queryParams),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            refreshInterval: 0,
            onSuccess: (data) => {
                const segments: segment[] = []
                data.records.segments.forEach(r => {
                    const start = getRecordingDate(r.start)
                    const end = getRecordingDate(r.end)
                    segments.push({ start: start, end: end, iso_start: r.start, iso_end: r.end })
                })

                setAvailableRecordings(segments)
            }
        }
    )

    const getRecords = async (r: string[], idx: number) => {
        setStreamId(null)
        setRecordDate(idx)
        setAvailableRecordings([])
        const start = r[0]
        const end = r[1]
        setQueryParams('?camera_id=' + params.id + '&start=' + start + '&end=' + end)
    }

    const streamRecord = async (r: segment, idx: number) => {
        setStreamId(idx)
        const start = r.iso_start
        const end = r.iso_end
        const q = '?camera_id=' + params.id + '&start=' + start + '&end=' + end
        const res = await fetch(process.env.NEXT_PUBLIC_API! + process.env.NEXT_PUBLIC_API_PORT + '/api/user/recording/stream/' + q, {
            method: 'GET',
            credentials: 'include'
        })

        if (res.ok) {
            const data: recordStream = await res.json()
            changeStream(data.stream.url, data.stream.format)
        }
    }

    return (
        <div className="w-11/12 mx-auto">
            <div className="flex flex-col gap-2 items-center justify-center mx-auto w-full relative">
                <h4 className="font-semibold">Available Recordings</h4>
                <div className="flex gap-2 items-center">
                    {intervals!.toReversed().map((r, idx) => {
                        return <div key={r[0]} onClick={() => getRecords(r, idx)} className={`${recordDate !== idx ? 'bg-indigo-300 hover:bg-indigo-500' : 'bg-indigo-600 pointer-events-none'} transition-all capitalize flex justify-center items-center rounded-full px-2 py-1 cursor-pointer text-xs font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>
                            {idx === 0
                                ?
                                <div>last 24hrs</div>
                                :
                                <div>{getDate(r)}</div>
                            }
                        </div>
                    })}
                </div>

                <div className="w-11/12 flex justify-center items-center">
                    {isLoading ?
                        <div className="animate-spin size-8 border-[4px] border-current border-t-transparent text-indigo-600 rounded-full">
                        </div>
                        :
                        <div className="flex items-center justify-center gap-2 flex-wrap text-nowrap py-2">
                            {availableRecordings.map((r, idx) => {
                                return <span onClick={() => streamRecord(r, idx)} key={idx} className={`bg-blue-100 ${streamId !== null && streamId !== idx && 'bg-blue-50 opacity-50 hover:opacity-100'} text-blue-800  cursor-pointer inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-blue-200 transition-all`}>
                                    {r.start + ' - ' + r.end}
                                </span>
                            })}
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}


const getDate = (dateString: string[]) => {

    if (dateString.length === 2) {
        const date0 = new Date(dateString[0])
        const date1 = new Date(dateString[1])

        const month = date0.toLocaleString('default', { month: 'short' })

        const date = `${date0.getUTCDate()} - ${date1.getUTCDate()} ${month}`

        return date
    }

    return ''
}

const getRecordingDate = (dateString: string) => {
    const date = new Date(dateString)
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesString = minutes < 10 ? '0' + minutes.toString() : minutes.toString();

    return `${hours}:${minutesString} ${ampm}`;
}