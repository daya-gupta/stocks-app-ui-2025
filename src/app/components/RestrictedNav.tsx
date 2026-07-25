import Link from "next/link";

export const RestrictedNav = () => {
    return (
        <div className="flex text-sm font-medium">
            <Link className="ml-6" href="/alpha/portfolio">Portfolio</Link>
            <Link className="ml-6" href="/alpha/commentary">Commentary</Link>
            <Link className="ml-6" href="/alpha/watchlist">Watchlist</Link>
            <Link className="ml-6" href="/alpha/youtube">YouTube</Link>
        </div>
    );
};