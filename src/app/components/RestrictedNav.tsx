import Link from "next/link";

export const RestrictedNav = () => {
    return (
        <div className="flex text-sm font-medium">
            <Link className="ml-8" href="/alpha/watchlist">Watchlist</Link>
            <Link className="ml-8" href="/alpha/portfolio">Portfolio</Link>
            <Link className="ml-8" href="/alpha/insights">Insights</Link>
        </div>
    );
};