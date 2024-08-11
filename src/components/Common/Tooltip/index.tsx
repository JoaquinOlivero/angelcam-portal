type Props = {
    content: string;
    children: React.ReactNode;
}

const Tooltip = ({ children, content }: Props) => {
    return (
        <div className="group/item relative flex">
            {children}
            <div className="w-auto scale-0 text-nowrap capitalize font-semibold z-50 absolute bottom-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition-all rounded bg-indigo-600 px-2 py-1 text-xs text-white group-hover/item:scale-100">{content}</div>
        </div>
    )
}

export default Tooltip