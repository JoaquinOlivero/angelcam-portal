import Navbar from "../Navbar";

const Layout = ({ children, showHeader }: Readonly<{
    children: React.ReactNode;
    showHeader: boolean;
}>) => {
    return (
        <div className="flex flex-col w-11/12 mx-auto h-screen">
            {showHeader && <Navbar />}
            {children}
        </div>
    )
}

export default Layout